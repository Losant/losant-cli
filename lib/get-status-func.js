const losant = require('losant-rest');
const {
  loadConfig,
  getRemoteStatus,
  getLocalStatus,
  logResult,
  logError,
  log
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

const getStatusFunc = (apiType, commandType, remoteStatusParams, localStatusParams, filterFunc) => {
  const getStatus = async (command) => {
    if (command.dir) {
      process.chdir(command.dir);
    }
    const config = loadConfig(command.config);
    const api = losant.createClient({ accessToken: config.apiToken });
    let results;
    try {
      results = await api[apiType].get({ applicationId: config.applicationId }) || [];
    } catch (err) {
      logError(err);
    }
    if (command.remote) {
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
      const localStatus = getLocalStatus(commandType, commandType, ...localStatusParams);
      if (localStatus.length === 0) {
        log(`No local ${commandType} found`);
      }
      localStatus.forEach(logStatus);
    }
  };
  return getStatus;
};

module.exports = getStatusFunc;
