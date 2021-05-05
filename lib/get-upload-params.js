const path         = require('path');
const { readFile } = require('fs-extra');
const { checksum } = require('./utils');
const FormData = require('form-data');
const mimeTypes = require('mime-types');
const { files, experience } = require('./constants');
const { buildMetaDataObj } = require('./meta-data-helpers');

const experienceParams = {
  apiType: experience.apiType,
  commandType: experience.commandType,
  localStatusParams: experience.localStatusParams,
  remoteStatusParams: experience.remoteStatusParams,
  getDeleteQuery: (item, config) => {
    return { applicationId: config.applicationId, experienceViewId: item.id };
  },
  getPatchData: async (item, config) => {
    const body = await readFile(item.file);
    return {
      applicationId: config.applicationId,
      experienceViewId: item.id,
      experienceView: { body: body.toString() }
    };
  },
  getPostData: async (item, config) => {
    const body = await readFile(item.file);
    const parentDir = path.parse(path.parse(item.file).dir).base;
    return {
      applicationId: config.applicationId,
      experienceView: {
        viewType: parentDir.slice(0, -1),
        name: item.name,
        body: body.toString()
      }
    };
  },
  postUpsertUpdateMeta: async (view, meta, localStatus) => {
    meta[localStatus.file] = buildMetaDataObj({ resource: view, md5: checksum(view.body), localStatus });
  }
};

const fileParams = {
  extraQuery: { type: 'file' },
  apiType: files.apiType,
  commandType: files.commandType,
  localStatusParams: files.localStatusParams,
  remoteStatusParams: files.remoteStatusParams,
  getDeleteQuery: (item, config) => {
    return { applicationId: config.applicationId, fileId: item.id };
  },
  getPatchData: (item, config) => {
    return {
      applicationId: config.applicationId,
      fileId: item.id,
      file:  {
        fileSize: item.size
      }
    };
  },
  getPostData: (item, config) => {
    const pathParts = path.parse(item.file);
    let parentDirectory = pathParts.dir.replace('files', '');
    if (!parentDirectory) { parentDirectory = '/'; }
    return {
      applicationId: config.applicationId,
      file: {
        name: item.name,
        parentDirectory,
        type: 'file',
        fileSize: item.size,
        contentType: mimeTypes.lookup(item.file) || 'application/octet-stream'
      }
    };
  },
  postUpsertUpdateMeta: async (result, meta, localStatus) => {
    const body = await readFile(localStatus.file);
    let s3etag;
    try {
      await new Promise((resolve, reject) => {
        const fd = new FormData();
        Object.keys(result.upload.fields).forEach((key) => {
          if (key !== 'bucket') {
            fd.append(key, result.upload.fields[key]);
          }
        });
        fd.append('file', body);
        fd.submit(result.upload.url, (err, res) => {
          if (err) { return reject(err); }
          s3etag = res.headers.etag.replace(/"/g, '');
          res.on('end', resolve);
          res.resume();
        });
      });
    } catch (e) {
      throw new Error(`An Error occurred when trying to upload ${localStatus.name} to s3 with the message ${e.message}`);
    }
    meta[localStatus.file] = buildMetaDataObj({ resource: result, md5: s3etag, localStatus });
  }
};

module.exports = {
  files: fileParams,
  experience: experienceParams
};
