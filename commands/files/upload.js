const { readFile } = require('fs-extra');
const path = require('path');
const FormData = require('form-data');
const mimeTypes = require('mime-types');
const { checksum } = require('../../lib/utils');
const  { files: { apiType, commandType, localStatusParams, remoteStatusParams } } = require('../../lib/constants');

const uploadConflictDetect = null; // todo
const getDeleteQuery = (item, config) => {
  return { applicationId: config.applicationId,  fileId: item.id };
};
const getPatchData = (item, config) => {
  return {
    applicationId: config.applicationId,
    fileId: item.id,
    file:  {
      fileSize: item.size
    }
  };
};

const getPostData = (item, config) => {
  const pathParts = path.parse(item.file);
  return {
    applicationId: config.applicationId,
    file: {
      name: item.name,
      parentDirectory: pathParts.slice(1, -1).join(path.sep),
      type: 'file',
      fileSize: item.size,
      contentType: mimeTypes.lookup(item.file)
    }
  };
};

const updateMeta = async (result, meta, item) => {
  const body = await readFile(item.file);
  const promise = new Promise((resolve, reject) => {
    const fd = new FormData();
    Object.keys(result.upload.fields).forEach((key) => {
      if (key !== 'bucket') {
        fd.append(key, result.upload.fields[key]);
      }
    });
    fd.append('file', body);
    fd.submit(result.upload.url, (err, res) => {
      if (err) {
        return reject(err);
      }
      res.on('end', () => {
        return resolve(result);
      });
    });
  });
  const file = await promise;
  const mtime = new Date(file.lastUpdated);
  meta[item.file] = {
    id: file.id,
    md5: checksum(body),
    remoteTime: mtime.getTime(),
    localTime: item.localModTime * 1000
  };
};
const params = {
  apiType,
  commandType,
  localStatusParams,
  remoteStatusParams,
  isConflictDetected: uploadConflictDetect,
  getDeleteQuery,
  getPatchData,
  getPostData,
  postUpsertUpdateMeta: updateMeta
};
module.export = (program) => {
  require('../utils/upload')(program,  params);
};
