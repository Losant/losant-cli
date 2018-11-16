const getApi = require('./get-api');
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
const { isEmpty, merge, values, keys } = require('omnibelt');

const getUploader = ({
  apiType, commandType, localStatusParams, remoteStatusParams, getDeleteQuery, getPatchData, getPostData, postUpsertUpdateMeta, extraQuery
}) => {
  const uploader = async (pattern, command = {}, loadedConfig) => {
    if (commandType === 'experience' && !isValidExperienceOptions(command)) { return; }
    const config = loadedConfig ? loadedConfig : await loadConfig();
    if (isEmpty(config)) { return; }
    const api = await getApi({ apiToken: config.apiToken });
    const meta = await loadLocalMeta(commandType) || {};
    try {
      let query = { applicationId: config.applicationId };
      if (extraQuery) {
        query = merge(query, extraQuery);
      }
      const items = await paginateRequest(api[apiType].get, query);

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

      await Promise.all(values(localStatusByFile).map(async (stat) => {
        logProcessing(stat.file);
        if (stat.status === 'deleted') {
          if (!command.dryRun) {
            try {
              await api[singular(apiType)].delete(await getDeleteQuery(stat, config));
            } catch (err) {
              const message = `An error ocured when trying to remove ${stat.file}, with the message ${err.message}`;
              return logError(message);
            }
            delete meta[stat.file];
          }
          return logResult('deleted', stat.file, 'yellow');
        }
        if (stat.status === 'unmodified') {
          return logResult('unmodified', stat.file);
        }
        const remoteInfo = remoteStatusByFile[stat.file] || {};
        if (
          (stat === 'added' && remoteInfo === 'added') ||
            (stat === 'modified' && remoteInfo === 'modified')
        ) {
          if (stat.localMd5 === remoteInfo.remoteMd5) {
            meta[stat.file] = {
              id: remoteInfo.id,
              md5: remoteInfo.remoteMd5,
              remoteTime: remoteInfo.remoteModTime,
              localTime: stat.localModTime * 1000
            };
            return logResult('uploaded', stat.file, 'green');
          }
        }
        if (!command.dryRun) {
          try {
            let action;
            if (stat.id) {
              if (stat.status === 'modified') {
                action = api[singular(apiType)].patch(await getPatchData(stat, config));
              }
            } else {
              action = api[apiType].post(await getPostData(stat, config));
            }
            const result = await action;
            await postUpsertUpdateMeta(result, meta, stat);
          } catch (e) {
            const message = `Error occured when attempting to upload ${stat.file}, with the message ${e.message}`;
            return logError(message);
          }
        }
        return logResult('uploaded', stat.file, 'green');
      }));
    } catch (error) {
      logError(error);
    } finally {
      if (!command.dryRun) {
        await saveLocalMeta(commandType, meta);
      }
    }
  };
  return uploader;
};

module.exports = getUploader;
