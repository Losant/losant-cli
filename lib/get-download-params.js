const request   = require('request-promise');
const { experience, files, dataTables } = require('./constants');

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
    return request({ method: 'GET', uri: file.url, encoding: null, strictSSL: (process.env.LOSANT_API_URL !== 'https://api.losant.space') });
  },
  apiType: files.apiType,
  commandType: files.commandType,
  localStatusParams: files.localStatusParams,
  remoteStatusParams: files.remoteStatusParams,
  extraQuery: { type: 'file' }
};

const dataTablesParams = {
  getData: async (dataTable) => {
    return dataTable;
  },
  apiType: dataTables.apiType,
  commandType: dataTables.commandType,
  extraQuery: { type: 'dataTable' }
};

module.exports = {
  experience: experienceParams,
  files: filesParams,
  dataTables: dataTablesParams
};
