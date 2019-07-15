const request   = require('request-promise');
const { experience, files, dataTables } = require('./constants');
const paginateRequest = require('./paginate-request');
const CSV = require('csv');
const { defer, endsWith, isEmpty } = require('omnibelt');
const utils = require('../lib/utils');

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
    },
    getStatus: async (items) => {
      const [ remoteStatusByFile, localStatusByFile ] = await Promise.all([
        utils.getShallowRemoteStatus('dataTables', items, ...dataTables.remoteStatusParams),
        utils.getShallowLocalStatus('dataTables', 'dataTables', ...dataTables.localStatusParams)
      ]);
      return { localStatusByFile, remoteStatusByFile };
    },
    getComparativeStatus: (localInfo, remoteInfo) => {
      const remoteStatus = !remoteInfo || isEmpty(remoteInfo) ? 'missing' : remoteInfo.status;
      const localStatus = !localInfo || isEmpty(localInfo) ? 'missing' : localInfo.status;
      let conflict = false;
      if ( localStatus === 'modified') {
        conflict = true;
      }
      if (localStatus === 'deleted' || remoteStatus === 'deleted' &&
         !(localStatus === 'deleted' && remoteStatus === 'deleted')) {
        conflict = true;
      }

      return { localStatus, remoteStatus, conflict };
    },
    getMeta: (remoteStatus) => {
      return { file: remoteStatus.file, id: remoteStatus.id };
    }
  }
};

module.exports = {
  experience: experienceParams,
  files: filesParams,
  dataTables: dataTablesParams
};
