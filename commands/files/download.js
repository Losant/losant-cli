const request = require('sync-request');
const minimatch = require('minimatch');
const { curry } = require('omnibelt');
const {
  constants: {
    files: {
      COMMAND_TYPE, API_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS
    }
  }
} = require('../../lib');

const downloaderGetData = async (file, item) => {
  const res = await request('GET', file.url);
  if (res.statusCode !== 200) {
    throw new Error(`${item.file} (${res.statusCode}: ${file.url})`);
  }
  return res.getBody();
};

const curriedFilterDownloadFunc = curry((pattern, file) => {
  if (file.type === 'directory') { return false; }
  if (!pattern) { return true; }
  return minimatch(file.parentDirectory + file.name, pattern);
});

const params = {
  apiType: API_TYPE,
  commandType: COMMAND_TYPE,
  localStatusParams: LOCAL_STATUS_PARAMS,
  remoteStatusParams: REMOTE_STATUS_PARAMS,
  getData: downloaderGetData,
  curriedFilterFunc: curriedFilterDownloadFunc
};

module.exports = (program) => {
  require('../utils/download')(program, params);
};
