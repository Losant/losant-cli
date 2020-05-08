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
const { isEmpty, merge, values, keys } = require('omnibelt');
const { buildMetaDataObj } = require('./meta-data-helpers');

const getUploader = ({
  apiType, commandType, localStatusParams, remoteStatusParams, getDeleteQuery, getPatchData, getPostData, postUpsertUpdateMeta, extraQuery
}) => {
  const uploader = async (pattern, command = {}, loadedConfig) => {
    if (commandType === 'experience' && !isValidExperienceOptions(command)) { return; }
    const config = loadedConfig ? loadedConfig : await loadConfig();
    if (isEmpty(config)) { return; }
    const api = config.api;
    const meta = await loadLocalMeta(commandType) || {};
    let items;
    try {
      let query = { applicationId: config.applicationId };
      if (extraQuery) {
        query = merge(query, extraQuery);
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
      type: command.type
    });

    if (command.dryRun) {
      logResult('DRY RUN');
    }
    if (isEmpty(localStatusByFile)) {
      if (!pattern) {
        return logResult('Missing', `No ${plural(commandType)} found to upload.`, 'yellow');
      } else {
        return logResult('No Matches', `No ${plural(commandType)} found that match this pattern ${pattern}`, 'yellow');
      }
    }

    if (!command.force) {
      const foundConflict = (keys(localStatusByFile)).find((file) => {
        return (getComparativeStatus(localStatusByFile[file], remoteStatusByFile[file])).conflict;
      });
      if (foundConflict) {
        return logResult('conflict', 'You are in a state of conflict cannot upload until resolved.', 'redBright');
      }
    }
    const uploadResults = await allSettledSerial(async (stat) => {
      logProcessing(stat.file);
      if (stat.status === 'unmodified') {
        return logResult('unmodified', stat.file);
      }
      if (stat.status === 'deleted') {
        if (!command.dryRun) {
          try {
            await api[singular(apiType)].delete(await getDeleteQuery(stat, config));
          } catch (err) {
            const message = `An error ocurred when trying to remove ${stat.file} with the message ${err.message}`;
            return logError(message);
          }
          delete meta[stat.file];
        }
        return logResult('deleted', stat.file, 'yellow');
      }
      const remoteStatus = remoteStatusByFile[stat.file] || {};
      if (
        (stat === 'added' && remoteStatus === 'added') ||
          (stat === 'modified' && remoteStatus === 'modified')
      ) {
        if (stat.localMd5 === remoteStatus.remoteMd5) {

          meta[stat.file] = buildMetaDataObj({ remoteStatus, localStatus: stat });
          return logResult('uploaded', stat.file, 'green');
        }
      }
      if (!command.dryRun) {
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
    }, values(localStatusByFile));
    uploadResults.forEach((result) => {
      // this should only occur on unhandled rejections any api error should have already logged and resolved the promise
      if (result.state !== 'fulfilled') {
        rollbarLog(result.reason);
        logError(result.reason);
      }
    });
    if (!command.dryRun) {
      await saveLocalMeta(commandType, meta);
    }
  };
  return uploader;
};

module.exports = getUploader;
