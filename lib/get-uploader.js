const paginateRequest = require('./paginate-request');
const {
  loadConfig,
  loadLocalMeta,
  saveLocalMeta,
  getStatus,
  logProcessing,
  logResult,
  logError,
  singular,
  getComparativeStatus,
  plural,
  isValidExperienceOptions
} = require('./utils');
const allSettledSerial = require('./all-settled-serial-p');
const { rollbarLog } = require('./rollbar');
const { isEmpty, mergeRight, values, keys } = require('omnibelt');

const getUploader = ({
  apiType, commandType, localStatusParams, remoteStatusParams, getDeleteQuery, getPatchData, getPostData, postUpsertUpdateMeta, extraQuery
}) => {
  const uploader = async (pattern, opts = {}, cmd, loadedConfig) => {
    if (commandType === 'experience' && !isValidExperienceOptions(opts)) { return; }
    const config = loadedConfig ? loadedConfig : await loadConfig();
    if (isEmpty(config)) { return; }
    const api = config.api;
    const meta = await loadLocalMeta(commandType);
    let items;
    try {
      let query = { applicationId: config.applicationId };
      if (extraQuery) {
        query = mergeRight(query, extraQuery);
      }
      items = await paginateRequest(api[apiType].get, query);
    } catch (e) {
      return logError(e);
    }
    const { remoteStatusByFile, localStatusByFile } = await getStatus({
      commandType,
      items,
      remoteStatusParams,
      localStatusParams,
      pattern,
      type: opts.type
    });
    if (opts.dryRun) {
      logResult('DRY RUN');
    }
    if (isEmpty(localStatusByFile)) {
      if (!pattern) {
        return logResult('Missing', `No ${plural(commandType)} found to upload.`, 'yellow');
      } else {
        return logResult('No Matches', `No ${plural(commandType)} found that match this pattern ${pattern}`, 'yellow');
      }
    }

    if (!opts.force) {
      const foundConflict = (keys(localStatusByFile)).find((file) => {
        return (getComparativeStatus(localStatusByFile[file], remoteStatusByFile[file])).conflict;
      });
      if (foundConflict) {
        return logResult('conflict', 'You are in a state of conflict cannot upload until resolved.', 'redBright');
      }
    }
    const statsByType = {
      unmodified: [],
      deleted: [],
      potentialUpdates: []
    };
    values(localStatusByFile).forEach((stat) => {
      if (statsByType[stat.status]) {
        return statsByType[stat.status].push(stat);
      }
      statsByType.potentialUpdates.push(stat);
    });

    statsByType.unmodified.forEach((stat) => {
      logProcessing(stat.file);
      return logResult('unmodified', stat.file);
    });
    const deleteResults = await allSettledSerial(async (stat) => {
      logProcessing(stat.file);
      const remoteStatus = remoteStatusByFile[stat.file];
      if (!opts.dryRun) {
        try {
          if (remoteStatus.status !== 'deleted') {
            await api[singular(apiType)].delete(await getDeleteQuery(stat, config));
          }
        } catch (err) {
          const message = `An error ocurred when trying to remove ${stat.file} with the message ${err.message}`;
          return logError(message);
        }
        delete meta[stat.file];
      }
      return logResult('deleted', stat.file, 'yellow');
    }, statsByType.deleted);

    const uploadResults = await allSettledSerial(async (stat) => {
      logProcessing(stat.file);
      if (!opts.dryRun) {
        let result;
        try {
          let action;
          if (stat.status === 'modified') {
            action = api[singular(apiType)].patch(await getPatchData(stat, config));
          } else {
            action = api[apiType].post(await getPostData(stat, config));
          }
          result = await action;
        } catch (e) {
          const message = `Error occurred when attempting to upload to Losant ${stat.file} with the message ${e.message}`;
          return logError(message);
        }
        try {
          await postUpsertUpdateMeta(result, meta, stat);
        } catch (e) {
          // this will currently only happen for files
          // postUpsertUpdateMeta only updates meta for files.
          // we should consider splitting the postUpset and update meta into two different functions
          // when we add more commands
          if (stat.status === 'added') {
            await api[singular(apiType)].delete(await getDeleteQuery(result, config));
          }
          return logError(e);
        }
      }
      return logResult('uploaded', stat.file, 'green');
    }, statsByType.potentialUpdates);
    [ ...deleteResults, ...uploadResults ].forEach((result) => {
      // this should only occur on unhandled rejections any api error should have already logged and resolved the promise
      if (result.state !== 'fulfilled') {
        rollbarLog(result.reason);
        logError(result.reason);
      }
    });
    if (!opts.dryRun) {
      await saveLocalMeta(commandType, meta);
    }
  };
  return uploader;
};

module.exports = getUploader;
