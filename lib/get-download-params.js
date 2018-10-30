const minimatch = require('minimatch');
const { curry } = require('omnibelt');
const request   = require('request-promise');
const { experience, files } = require('./constants');

const experienceParams = {
  getData: async (view) => {
    return view.body;
  },
  curriedFilterFunc: curry((pattern, view) => {
    return minimatch(view.name, pattern);
  }),
  apiType: experience.apiType,
  commandType: experience.commandType,
  localStatusParams: experience.localStatusParams,
  remoteStatusParams: experience.remoteStatusParams
};

const filesParams = {
  getData: async (file) => {
    return request({ method: 'GET', uri: file.url, encoding: null, strictSSL: (process.env.LOSANT_API_URL !== 'https://api.losant.space') });
  },
  curriedFilterFunc: curry((pattern, file) => {
    return minimatch(`${file.parentDirectory}${file.name}`, pattern);
  }),
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
