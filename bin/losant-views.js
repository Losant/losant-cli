#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const minimatch = require('minimatch');
const { curry } = require('omnibelt');
const { readFile } = require('fs-extra');
const {
  utils: { checksum, log },
  watchFiles,
  getStatusFunc,
  getDownloader,
  getUploader
} = require('../lib');
const request = require('request');

const COMMAND_TYPE = 'views';
const API_TYPE = 'experienceViews';
const LOCAL_STATUS_PARAMS = [ '/**/*.hbs' ];
const REMOTE_STATUS_PARAMS = [ 'views/${viewType}s/${name}.hbs', 'body' ]; // eslint-disable-line no-template-curly-in-string


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
  apitType: API_TYPE,
  commandType: COMMAND_TYPE,
  localStatusParams: LOCAL_STATUS_PARAMS,
  remoteStatusParams: REMOTE_STATUS_PARAMS,
  getData: downloaderGetData,
  curriedFilterFunc: curriedFilterDownloadFunc
});

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
  // mkdirp.sync(path.dirname(item.file))
  // fs.writeFileSync(item.file, view.body)
  meta[item.file] = {
    id: view.id,
    md5: checksum(view.body),
    remoteTime: mtime.getTime(),
    localTime: item.localModTime * 1000
  };
};

const uploader = getUploader({
  apiType: 'experienceView',
  commandType: COMMAND_TYPE,
  localStatusParams: LOCAL_STATUS_PARAMS,
  remoteStatusParams: REMOTE_STATUS_PARAMS,
  isConflictDetected: uploadConflictDetect,
  getDeleteQuery,
  getPatchData,
  getPostData,
  postUpsertUpdateMeta: updateMeta
});

program.description('Manage Losant Experience Views from the command line');

// TODO updated downloader to handle a version write the version name to the file.
// TODO ADD .option('-v, --version <version>', 'version of the experience view you would like to checkout. (default: develop)')
program
  .command('download [pattern]')
  .option('-f, --force', 'force all changes by ignoring modification checking')
  .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
  .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
  .option('--dry-run', 'display actions but do not perform them')
  .action(downloader);

// TODO ADD :: .option('-o, --overwrite', 'overwrite develop forcibly')
// TODO ensure expierence views are being saved a "develop" versions
// when the next upload happens save the version if it is not "develop" that was "checkedout" on the they will have to pass the overwrite develop
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
  .action(getStatusFunc({
    apiType: API_TYPE,
    commandType: COMMAND_TYPE,
    localStatusParams: LOCAL_STATUS_PARAMS,
    remoteStatusParams: REMOTE_STATUS_PARAMS
  }));

program
  .command('version [version]')
  .option('-l, --list <pattern>', 'list all versions like this pattern')
  .option('-d, --description <description>', 'a description to attach to this version')
  .action(require('../lib/experience-version'));

program
  .command('watch')
  .option('-c, --config <file>', 'config file to run the command with')
  .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
  .action(watchFiles);

program.on('--help', () => {
  log('');
  log('  Examples:');
  log('');
  log('    Download all views');
  log('     $ losant views download \n');
  log('    Download component views');
  log('     $ losant views download components/* \n');
  log('    Force a download of all views overwriting local modifications');
  log('     $ losant views download -f \n');
  log('    Check local modification status');
  log('     $ losant views status \n');
  log('    Check remote modification status');
  log('     $ losant views status -r \n');
  log('    Upload all view');
  log('     $ losant views upload \n');
  log('    Upload component view');
  log('     $ losant views upload components/* \n');
  log('    Force an upload of all views overwriting remote modifications');
  log('     $ losant views upload -f \n');
  log('');
});

program.parse(process.argv);
