const request   = require('request-promise');
const { experience, files, dataTables } = require('./constants');
const paginateRequest = require('./paginate-request');
const CSV = require('csv');
const { defer } = require('omnibelt');

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
  localStatusParams: dataTables.localStatusParams,
  remoteStatusParams: dataTables.remoteStatusParams,
  extraQuery: { type: 'dataTable' },
  options: {
    getData: async (dataTable, api) => {
      let data;
      const deferred = defer();
      const rows = await paginateRequest(api.dataTableRows.get, { applicationId: dataTable.applicationId, dataTableId: dataTable.id });
      CSV.stringify(rows, { header: true }, (err, output) => {
        data = output;
        deferred.resolve();
        if (err) {
          throw err;
        }
      });
      await deferred.promise;
      return data;
    }
  }
};

module.exports = {
  experience: experienceParams,
  files: filesParams,
  dataTables: dataTablesParams
};
