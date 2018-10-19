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
const locker = require('./locker');
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

const getStatusFunc = ({ apiType, commandType, localStatusParams, remoteStatusParams, filterFunc }) => {
  const getStatus = async (command) => {
    setDir(command);
    const releaselocks = await locker(commandType);
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
      const remoteStatus = await getRemoteStatus(commandType, results.items, ...remoteStatusParams);
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
    await releaselocks();
  };
  return getStatus;
};

module.exports = getStatusFunc;
