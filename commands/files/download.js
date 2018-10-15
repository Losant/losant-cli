const request   = require('sync-request');
const minimatch = require('minimatch');
const { curry } = require('omnibelt');

const getData = async (file, item) => {
  const res = await request('GET', file.url);
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
  require('../utils/download')(program, 'files', { getData, curriedFilterFunc });
};
