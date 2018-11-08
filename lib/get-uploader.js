const getApi = require('./get-api');
const paginateRequest = require('./paginate-request');
const {
  loadConfig,
  loadLocalMeta,
  saveLocalMeta,
  getRemoteStatus,
  getLocalStatus,
  logProcessing,
  logResult,
  logError,
  singular,
  getComparativeStatus
} = require('./utils');
const { isEmpty, merge, values, keys, startsWith } = require('omnibelt');

const getUploader = ({
  apiType, commandType, localStatusParams, remoteStatusParams, getDeleteQuery, getPatchData, getPostData, postUpsertUpdateMeta, extraQuery
}) => {
  const uploader = async (pattern, command, loadedConfig) => {
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
      if (pattern) {
        if (commandType !== 'experience') {
          localStatusParams[0] = pattern;
        } else {
          let buildPattern = '';
          if (command.type) { buildPattern = `${command.type}`; }
          if (!startsWith('/', pattern)) { pattern = `/${pattern}`; }
          buildPattern = `${buildPattern}${pattern}`;
          localStatusParams[0] = buildPattern;
        }
      }
      const [ remoteStatusByFile, localStatusByFile ] = await Promise.all([
        getRemoteStatus(commandType, items, ...remoteStatusParams),
        getLocalStatus(commandType, commandType, ...localStatusParams)
      ]);

      if (command.dryRun) {
        logResult('DRY RUN');
      }
      if (isEmpty(localStatusByFile)) {
        if (!pattern) {
          return logResult('Missing', 'No files found to upload.');
        } else {
          return logResult('No Matches', `No files found that match this pattern ${pattern}`);
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
            await api[singular(apiType)].delete(await getDeleteQuery(stat, config));
            delete meta[stat.file];
          }
          return logResult('deleted', stat.file, 'yellow');
        }
        if (stat.status === 'unmodified') {
          return logResult('unmodified', stat.file);
        }
        if (!command.dryRun) {
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
        }
        return logResult('uploaded', stat.file, 'green');
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
