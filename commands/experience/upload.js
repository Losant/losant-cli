const path = require('path');
const { readFile } = require('fs-extra');
const { utils: { checksum }, constants: { experience: { API_TYPE, COMMAND_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS } } } = require('../../lib');

const uploadConflictDetect = (item, remoteStatus) => {
  return remoteStatus && remoteStatus.status !== 'unmodified';
};

const getDeleteQuery = (item, config) => {
  return { applicationId: config.applicationId,  experienceViewId: item.id };
};

const getPatchData = async (item, config) => {
  const body = await readFile(item.file);
  return {
    applicationId: config.applicationId,
    experienceViewId: item.id,
    experienceView:  { body: body.toString() }
  };
};

const getPostData = async (item, config) => {
  const body = await readFile(item.file);
  const pathParts = item.file.split(path.sep);
  return {
    applicationId: config.applicationId,
    experienceView: {
      viewType: pathParts[1].slice(0, -1),
      name: item.name,
      body: body.toString()
    }
  };
};

const updateMeta = async (view, meta, item) => {
  const mtime = new Date(view.lastUpdated);
  meta[item.file] = {
    id: view.id,
    md5: checksum(view.body),
    remoteTime: mtime.getTime(),
    localTime: item.localModTime * 1000
  };
};

const params = {
  apiType: API_TYPE,
  commandType: COMMAND_TYPE,
  localStatusParams: LOCAL_STATUS_PARAMS,
  remoteStatusParams: REMOTE_STATUS_PARAMS,
  isConflictDetected: uploadConflictDetect,
  getDeleteQuery,
  getPatchData,
  getPostData,
  postUpsertUpdateMeta: updateMeta
};

module.exports = (program) => {
  require('../utils/upload')(program, params);
};
