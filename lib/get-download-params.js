const axios = require('axios');
const { experience, files } = require('./constants');

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
  getData: async (file) => {
    const resp = await axios({
      method: 'GET',
      url: file.url,
      responseType: 'arraybuffer'
    });
    return resp.data;
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
