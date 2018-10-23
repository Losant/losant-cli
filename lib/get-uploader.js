const getApi = require('./get-api');
const {
  loadConfig,
  loadLocalMeta,
  saveLocalMeta,
  getRemoteStatus,
  getLocalStatus,
  logProcessing,
  logResult,
  logError,
  setDir,
  mapById,
  singular
} = require('./utils');
const { isEmpty } = require('omnibelt');

const getUploader = ({
  apiType, commandType, localStatusParams, remoteStatusParams, isConflictDetected, getDeleteQuery, getPatchData, getPostData, postUpsertUpdateMeta
}) => {
  const uploader = async (pattern, command) => {
    setDir(command);
    const config = await loadConfig(command.config);
    if (isEmpty(config)) { return; }
    const api = await getApi({ apiToken: config.apiToken });
    const meta = await loadLocalMeta(commandType) || {};
    try {
      const query = { applicationId: config.applicationId };
      if (pattern) {
        query.filterField = 'name';
        query.filter = pattern;
      }
      const results = await api[apiType].get(query);
      const items = results.items;
      // grab remote status and map to file
      const remoteStatus = await getRemoteStatus(commandType, items, ...remoteStatusParams);
      const remoteStatusById = mapById(remoteStatus);
      // iterate over local status and perform the appropriate action
      if (pattern) { localStatusParams[0] = pattern; }
      const localStatus = await getLocalStatus(commandType, commandType, ...localStatusParams);
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
            return logResult('conflict', stat.file, 'redBright');
          }
        }
        if (stat.status === 'deleted') {
          if (!command.dryRun) {
            await api[singular(apiType)].delete(await getDeleteQuery(stat, config));
            delete meta[stat.file];
          }
          return logResult('deleted', stat.file, 'yellow');
        }
        if (!command.dryRun) {
          let action;
          if (stat.id) {
            action = api[singular(apiType)].patch(await getPatchData(stat, config));
          } else {
            action = api[apiType].post(await getPostData(stat, config));
          }
          const result = await action;
          await postUpsertUpdateMeta(result, meta, stat);
        }
        logResult('uploaded', stat.file, 'green');
      }));
    } catch (error) {
      logError(error);
    } finally {
      await saveLocalMeta(commandType, meta);
    }
  };
  return uploader;
};

module.exports = getUploader;
