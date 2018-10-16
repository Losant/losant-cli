const path         = require('path');
const { readFile } = require('fs-extra');
const { checksum } = require('../../lib/utils');
const { experience: { apiType, commandType, localStatusParams, remoteStatusParams } } = require('../../lib/constants');

const isConflictDetected = (item, remoteStatus) => {
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
  const pathParts = path.parse(item.file);
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
  apiType,
  commandType,
  localStatusParams,
  remoteStatusParams,
  isConflictDetected,
  getDeleteQuery,
  getPatchData,
  getPostData,
  postUpsertUpdateMeta: updateMeta
};

module.exports = (program) => {
  require('../utils/upload')(program, params);
};
