const { dataTables } = require('./constants');
const paginateRequest = require('./paginate-request');
const { stringify } = require('csv-stringify');
const { defer } = require('omnibelt');

const dataTablesParams = {
  apiType: dataTables.apiType,
  commandType: dataTables.commandType,
  localStatusParams: dataTables.localStatusParams,
  remoteStatusParams: dataTables.remoteStatusParams,
  getData: async (dataTable, api) => {
    let data;
    const deferred = defer();
    const rows = await paginateRequest(api.dataTableRows.get, { applicationId: dataTable.applicationId, dataTableId: dataTable.id }, true);
    stringify(rows, { header: true }, (err, output) => {
      data = output;
      deferred.resolve();
      if (err) {
        throw err;
      }
    });
    await deferred.promise;
    return data;
  }
};

module.exports = {
  dataTables: dataTablesParams
};
