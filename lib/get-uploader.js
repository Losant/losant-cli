const losant = require('losant-rest');
const {
  loadConfig,
  loadLocalMeta,
  saveLocalMeta,
  getRemoteStatus,
  getLocalStatus,
  logProcessing,
  logResult,
  logError,
  setDir
} = require('./utils');
const getUploader = (apiType, commandType, localStatusParams, remoteStatusParams, isConflictDetected, getDeleteQuery, getPatchData, getPostData, postUpsertUpdateMeta) => {
  const uploader = async (pattern, command) => {
    setDir(command);
    const config = loadConfig(command.config);
    const api = losant.createClient({ accessToken: config.apiToken });
    const meta = loadLocalMeta(commandType) || {};
    try {
      const results = await api[`${apiType}s`].get({ applicationId: config.applicationId });
      const items = results.items;
      // grab remote status and map to file
      const remoteStatus = getRemoteStatus(commandType, items, ...remoteStatusParams);
      const remoteStatusById = {};
      remoteStatus.forEach((item) => {
        if (item.id) {
          remoteStatusById[item.id] = item;
        }
      });
      // iterate over local status and perform the appropriate action
      const localStatus = getLocalStatus(commandType, commandType, ...localStatusParams);
      if (command.dryRun) {
        logResult('DRY RUN');
      }
      await Promise.all(localStatus.map(async (stat) => {
        logProcessing(stat.file);
        // if forcing the update ignore conflicts and remote modifications
        if (!command.force) {
          if (stat.status === 'unmodified') {
            return logResult('unmodified', stat.file);
          }

          if (isConflictDetected && isConflictDetected(stat, remoteStatusById[stat.id])) {
            return logResult('conflict', stat.file, 'red');
          }
        }
        if (stat.status === 'deleted') {
          if (!command.dryRun) {
            await api[apiType].delete(await getDeleteQuery(stat, config));
            delete meta[stat.file];
          }
          return logResult('deleted', stat.file, 'yellow');
        }
        if (!command.dryRun) {
          let action;
          if (stat.id) {
            action = api[apiType].patch(await getPatchData(stat, config));
          } else {
            action = api[apiType].post(await getPostData(stat, config));
          }
          const result = await action;
          await postUpsertUpdateMeta(result, meta, stat);
        }
        logResult('uploaded', stat.file, 'green');
      }));
      saveLocalMeta(commandType, meta);
    } catch (error) {
      saveLocalMeta(commandType, meta);
      logError(error);
    }
  };
  return uploader;
};

module.exports = getUploader;
