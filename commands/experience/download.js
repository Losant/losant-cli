const minimatch = require('minimatch');
const request = require('request');
const {
  getDownloader, constants: {
    COMMAND_TYPE, API_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS
  }
} = require('../../lib');
const { curry } = require('omnibelt');

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

module.exports = (program) => {
  program
    .command('download [pattern]')
    .option('-f, --force', 'force all changes by ignoring modification checking')
    .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
    .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
    .option('--dry-run', 'display actions but do not perform them')
    .action(downloader);
};
