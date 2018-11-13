const path = require('path');
const getApi = require('./get-api');
const paginateRequest = require('./paginate-request');
const {
  loadConfig,
  getRemoteStatus,
  getLocalStatus,
  logError,
  log,
  getComparativeStatus,
  singular
} = require('./utils');
const c = require('chalk');

const statusByColor = {
  added: c.green('added'),
  modified: c.yellow('modified'),
  unmodified: c.gray('unmodified'),
  deleted: c.red('deleted'),
  missing:  c.blue('missing')
};

const conflictRed = c.redBright('true');
const notConflict = c.gray('false');

const printTable = require('./print-table');
const { merge, union, keys } = require('omnibelt');

const colorifyStatus = (status) => {
  return statusByColor[status] || c.gray(status);
};

const getDirectory = (commandType, file) => {
  const parsed = path.parse(file);
  // remove the files or expierence dir name and then remove the leading /
  let dir = parsed.dir.replace(commandType, '');
  if (dir !== path.sep) { dir = dir.replace(new RegExp(path.sep), ''); }
  if (commandType === 'experience') { dir = singular(dir); }
  return dir || path.sep;
};


const getStatusFunc = ({ apiType, commandType, localStatusParams, remoteStatusParams, getQuery = {} }) => {
  const HEADERS = [
    'Name',
    commandType === 'experience' ? 'View Type' : 'Directory',
    'Local Status',
    'Remote Status',
    'Conflict'
  ];
  const getStatus = async () => {
    const { applicationId, apiToken } = await loadConfig();
    if (!applicationId || !apiToken) { return; }
    const api = await getApi({ apiToken });
    let items;
    try {
      const query = merge({ applicationId }, getQuery);
      items = await paginateRequest(api[apiType].get, query);
    } catch (err) {
      logError(err);
      return;
    }
    const [ allRemoteStatusByFile, allLocalStatusByFile ] = await Promise.all([
      getRemoteStatus(commandType, items, ...remoteStatusParams),
      getLocalStatus(commandType, commandType, ...localStatusParams)
    ]);
    const allFiles = union(keys(allLocalStatusByFile), keys(allRemoteStatusByFile)).sort();
    const columns = allFiles.map((file) => {
      const remoteInfo = allRemoteStatusByFile[file] || {};
      const localInfo = allLocalStatusByFile[file] || {};
      const column = [];
      column.push(remoteInfo.name || localInfo.name);
      column.push(getDirectory(commandType, remoteInfo.file || localInfo.file));
      const { remoteStatus, localStatus, conflict } = getComparativeStatus(localInfo, remoteInfo);
      column.push(colorifyStatus(localStatus));
      column.push(colorifyStatus(remoteStatus));
      if (conflict) {
        column.push(conflictRed);
      } else {
        column.push(notConflict);
      }
      return column;
    });
    if (!columns.length) {
      log(`No ${commandType} found.`);
    } else {
      printTable(HEADERS, columns);
    }
  };
  return getStatus;
};

module.exports = getStatusFunc;
