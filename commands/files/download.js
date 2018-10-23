const request   = require('request-promise');
const minimatch = require('minimatch');
const { curry } = require('omnibelt');
const { files: { apiType, commandType, localStatusParams, remoteStatusParams } } = require('../../lib/constants');
const getData = (file) => {
  return request({ method: 'GET', uri: file.url, encoding: null });
};

const curriedFilterFunc = curry((pattern, file) => {
  if (file.type === 'directory') { return false; }
  if (!pattern) { return true; }
  return minimatch(`${file.parentDirectory}${file.name}`, pattern);
});

module.exports = (program) => {
  require('../utils/download')(program, {
    apiType, commandType, localStatusParams, remoteStatusParams, getData, curriedFilterFunc
  });

  return {
    helpLines: [
      'Download all files',
      '$ losant files download',
      'Download files in images directory',
      '$ losant files download images/*',
      'Force a download of all files overwriting local modifications',
      '$ losant files download -f'
    ]
  };
};
