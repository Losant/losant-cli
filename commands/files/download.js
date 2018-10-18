const request   = require('request-promise');
const minimatch = require('minimatch');
const { curry } = require('omnibelt');
const { files: { apiType, commandType, localStatusParams, remoteStatusParams } } = require('../../lib/constants');
const getData = async (file, item) => {
  console.log('trying to request file from AWS...');
  console.log(file.url);
  const res = await request.get(file.url);
  if (res.statusCode !== 200) {
    throw new Error(`${item.file} (${res.statusCode}: ${file.url})`);
  }
  return res.getBody();
};

const curriedFilterFunc = curry((pattern, file) => {
  if (file.type === 'directory') { return false; }
  if (!pattern) { return true; }
  return minimatch(file.parentDirectory + file.name, pattern);
});

module.exports = (program) => {
  require('../utils/download')(program, {
    apiType, commandType, localStatusParams, remoteStatusParams, getData, curriedFilterFunc
  });
};
