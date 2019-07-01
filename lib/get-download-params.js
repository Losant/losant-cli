const request   = require('request-promise');
const { experience, files } = require('./constants');
const { endsWith } = require('omnibelt');

const experienceParams = {
  getData: async (view) => {
    return view.body;
  },
  apiType: experience.apiType,
  commandType: experience.commandType,
  localStatusParams: experience.localStatusParams,
  remoteStatusParams: experience.remoteStatusParams
};

const filesParams = {
  getData: async (file, api) => {
    return request({ method: 'GET', uri: file.url, encoding: null, strictSSL: !endsWith('space', api.getOption('url')) });
  },
  apiType: files.apiType,
  commandType: files.commandType,
  localStatusParams: files.localStatusParams,
  remoteStatusParams: files.remoteStatusParams,
  extraQuery: { type: 'file' }
};

module.exports = {
  experience: experienceParams,
  files: filesParams
};
