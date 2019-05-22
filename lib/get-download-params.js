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
    //console.log(dataTable);
    //return request({ method: 'GET', uri: `https://app.losant.com${dataTable._links.self.href}`});
    const { applicationId, id } = dataTable;
    return { applicationId, id };
  },
  apiType: dataTables.apiType,
  commandType: dataTables.commandType,
  localStatusParams: dataTables.localStatusParams,
  remoteStatusParams: dataTables.remoteStatusParams,
  extraQuery: { type: 'dataTable' }
};

module.exports = {
  experience: experienceParams,
  files: filesParams,
  dataTables: dataTablesParams
};
