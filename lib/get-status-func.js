const getApi = require('./get-api');
const {
  loadConfig,
  getRemoteStatus,
  getLocalStatus,
  logResult,
  logError,
  log,
  setDir,
  plural
} = require('./utils');

const logStatus = (item) => {
  if (item.status === 'added') {
    logResult(item.status, item.file, 'green');
  } else if (item.status === 'modified') {
    logResult(item.status, item.file, 'yellow');
  } else if (item.status === 'deleted') {
    logResult(item.status, item.file, 'red');
  } else {
    logResult(item.status, item.file);
  }
};

const getStatusFunc = ({ apiType, commandType, localStatusParams, remoteStatusParams, filterFunc }) => {
  const getStatus = async (command) => {
    setDir(command);
    const { applicationId, apiToken } = await loadConfig(command.config);
    if (!applicationId && !apiToken) { return; }
    const api = await getApi({ apiToken });
    if (command.remote) {
      let results;
      try {
        results = await api[apiType].get({ applicationId }) || [];
      } catch (err) {
        logError(err);
        process.exit(1);
      }
      if (filterFunc) {
        results.items = results.items.filter(filterFunc);
      }
      const remoteStatus = getRemoteStatus(commandType, results.items, ...remoteStatusParams);
      if (remoteStatus.length === 0) {
        log(`No remote ${commandType} found`);
      }
      remoteStatus.forEach(logStatus);
    } else {
      // TODO update second parameter commandType to the directory, which for now is the commandType
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
