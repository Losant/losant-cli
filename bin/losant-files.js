#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const minimatch = require('minimatch');
const request = require('sync-request');
const FormData = require('form-data');
const mimeTypes = require('mime-types');
const { curry } = require('omnibelt');
const { readFile } = require('fs-extra');
const {
  utils: { log, checksum },
  watchFiles,
  getStatusFunc,
  getDownloader,
  getUploader
} = require('../lib');

const COMMAND_TYPE = 'files';
const API_TYPE = 'files';
const LOCAL_STATUS_PARAMS = [ '/**/*.*' ];
const REMOTE_STATUS_PARAMS = [ 'files${parentDirectory}${name}' ]; // eslint-disable-line no-template-curly-in-string

const downloaderGetData = async (file, item) => {
  const res = await request('GET', file.url);
  if (res.statusCode !== 200) {
    throw new Error(`${item.file} (${res.statusCode}: ${file.url})`);
  }
  return res.getBody();
};

const curriedFilterDownloadFunc = curry((pattern, file) => {
  if (file.type === 'directory') { return false; }
  if (!pattern) { return true; }
  return minimatch(file.parentDirectory + file.name, pattern);
});

const downloader = getDownloader({
  apiType: API_TYPE,
  commandType: COMMAND_TYPE,
  localStatusParams: LOCAL_STATUS_PARAMS,
  remoteStatusParams: REMOTE_STATUS_PARAMS,
  getData: downloaderGetData,
  curriedFilterFunc: curriedFilterDownloadFunc
});

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
  const pathParts = item.file.split(path.sep);
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
      res.on('data', (chunk) => {
        body.push(chunk);
      });
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

const uploader = getUploader({
  apiType: 'file',
  commandType: COMMAND_TYPE,
  localStatusParams: LOCAL_STATUS_PARAMS,
  remoteStatusParams: REMOTE_STATUS_PARAMS,
  isConflictDetected: uploadConflictDetect,
  getDeleteQuery,
  getPatchData,
  getPostData,
  postUpsertUpdateMeta: updateMeta
});

const getStatus = getStatusFunc({
  apiType: API_TYPE,
  commandType: COMMAND_TYPE,
  localStatusParams: LOCAL_STATUS_PARAMS,
  remoteStatusParams: REMOTE_STATUS_PARAMS,
  filterFunc: (item) => { return item.type === 'file'; }
});

program
  .description('Manage Losant Files from the command line');

program
  .command('download [pattern]')
  .option('-f, --force', 'force all changes by ignoring modification checking')
  .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
  .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
  .option('--dry-run', 'display actions but do not perform them')
  .action(downloader);

program
  .command('upload [pattern]')
  .option('-f, --force', 'force all changes by ignoring modification checking')
  .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
  .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
  .option('--dry-run', 'display actions but do not perform them')
  .action(uploader);

program
  .command('status')
  .option('-c, --config <file>', 'config file to run the command with')
  .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
  .option('-r, --remote', 'show remote file status')
  .action(getStatus);

program
  .command('watch')
  .option('-c, --config <file>', 'config file to run the command with')
  .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
  .action(watchFiles);

program.on('--help', () => {
  log('');
  log('  Examples:');
  log('');
  log('    Download all files');
  log('     $ losant files download \n');
  log('    Download files in images directory');
  log('     $ losant files download images/* \n');
  log('    Force a download of all files overwriting local modifications');
  log('     $ losant files download -f \n');
  log('    Check local modification status');
  log('     $ losant files status \n');
  log('    Check remote modification status');
  log('     $ losant files status -r \n');
  log('    Upload all files');
  log('     $ losant files upload \n');
  log('    Upload files in images directory');
  log('     $ losant files upload images/* \n');
  log('    Force an upload of all files overwriting remote modifications');
  log('     $ losant files upload -f \n');
  log('');
});

program.parse(process.argv);