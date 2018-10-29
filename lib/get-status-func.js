const getApi = require('./get-api');
const paginateRequest = require('./paginate-request');
const {
  loadConfig,
  getRemoteStatus,
  getLocalStatus,
  logResult,
  logError,
  log,
  plural
} = require('./utils');
const { merge } = require('omnibelt');
const logStatus = (item) => {
  if (item.status === 'added') {
    logResult(item.status, item.file, 'green');
  } else if (item.status === 'modified') {
    logResult(item.status, item.file, 'yellow');
  } else if (item.status === 'deleted') {
    logResult(item.status, item.file, 'redBright');
  } else {
    logResult(item.status, item.file);
  }
};

const getStatusFunc = ({ apiType, commandType, localStatusParams, remoteStatusParams, getQuery = {} }) => {
  const getStatus = async (command) => {
    const { applicationId, apiToken } = await loadConfig();
    if (!applicationId || !apiToken) { return; }
    const api = await getApi({ apiToken });
    if (command.remote) {
      let items;
      try {
        const query = merge({ applicationId }, getQuery);
        items = await paginateRequest(api[apiType].get, query);
      } catch (err) {
        logError(err);
        process.exit(1);
      }
      const remoteStatus = await getRemoteStatus(commandType, items, ...remoteStatusParams);
      if (remoteStatus.length === 0) {
        log(`No remote ${commandType} found`);
      }
      remoteStatus.forEach(logStatus);
    } else {
      const localStatus = await getLocalStatus(commandType, commandType, ...localStatusParams);
      if (localStatus.length === 0) {
        log(`No local ${plural(commandType)} found`);
      }
      localStatus.forEach(logStatus);
    }
  };
  return getStatus;
};

module.exports = getStatusFunc;
