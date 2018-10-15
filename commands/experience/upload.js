const path = require('path');
const { readFile } = require('fs-extra');
const { getUploader, utils: { checksum }, constants: { experience: { COMMAND_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS } } } = require('../../lib');

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

module.exports = (program) => {
  program
    .command('upload [pattern]')
    .option('-f, --force', 'force all changes by ignoring modification checking')
    .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
    .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
    .option('--dry-run', 'display actions but do not perform them')
    .action(uploader);
};
