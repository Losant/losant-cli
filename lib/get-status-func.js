const getApi = require('./get-api');
const paginateRequest = require('./paginate-request');
const {
  loadConfig,
  getRemoteStatus,
  getLocalStatus,
  logResult,
  logError,
  log,
  plural
} = require('./utils');
const c = require('chalk');

const modified = c.yellow('modified');
const unmodified = c.gray('unmodified');
const conflict = c.redBright('true');
const notConflict = c.gray('false');
const added = c.green('added');
const deleted = c.red('deleted');
const missing = c.blue('missing');

const printTable = require('./print-table');
const { merge, keyBy, join, difference } = require('omnibelt');
const mapByFileId = keyBy((obj) => { return `${obj.file}-${obj.id}`; });
const logStatus = (item) => {
  if (item.status === 'added') {
    logResult(item.status, item.file, 'green');
  } else if (item.status === 'modified') {
    logResult(item.status, item.file, 'yellow');
  } else if (item.status === 'deleted') {
    logResult(item.status, item.file, 'redBright');
  } else {
    logResult(item.status, item.file);
  }
};

const colorifyStatus = (status) => {
   if (status === 'added') {
    return added;
  } else if (status === 'modified') {
    return modified;
  } else if (status === 'deleted') {
    return deleted;
  }
  return c.gray(status);
}

const HEADERS = [ 'Name', 'Local Status', 'Remote Status', 'Conflict' ];

const getStatusFunc = ({ apiType, commandType, localStatusParams, remoteStatusParams, getQuery = {} }) => {
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
      process.exit(1);
    }
    const remoteStatus = await getRemoteStatus(commandType, items, ...remoteStatusParams) || [];
    const remoteStatusById = mapByFileId(remoteStatus);
    // console.log(remoteStatusById)
    // console.log(remoteStatus);
    if (remoteStatus.length === 0) {
      log(`No remote ${commandType} found`);
    }
    // console.log('start of remote...');
    const localStatus = await getLocalStatus(commandType, commandType, ...localStatusParams);
    if (localStatus.length === 0) {
      log(`No local ${plural(commandType)} found`);
    }
    // console.log('start of local...');
    const localStatusById = mapByFileId(localStatus);
    // console.log(localStatusById);
    const localIds = Object.keys(localStatusById);
    const remoteIds = Object.keys(remoteStatusById);
    const columns = [];
    remoteIds.forEach((id) => {
      const remoteInfo = remoteStatusById[id];
      const localInfo = localStatusById[id] || {};
      const column = [];
      column.push(remoteInfo.name);
      const lStatus = localInfo.status || missing;
      const rStatus = remoteInfo.status;
      column.push(colorifyStatus(lStatus));
      column.push(colorifyStatus(rStatus));
      if (lStatus === 'modified' && rStatus === 'modified') {
        column.push(conflict);
      } else {
        column.push(notConflict);
      }
      columns.push(column);
    });
    console.log(remoteIds);
    console.log(localIds);
    const localIdsLeft = difference(localIds, remoteIds);
    console.log(localIdsLeft);
    localIdsLeft.forEach((id) => {
      const column = [];
      console.log(localStatusById[id]);
      column.push(localStatusById[id].name);
      const lStatus = localStatusById[id].status;
      const rStatus = 'unknown';
      column.push(colorifyStatus(lStatus));
      column.push(colorifyStatus(rStatus));
      column.push(notConflict);
      columns.push(column);
    });

    printTable(HEADERS, columns);
  };
  return getStatus;
};

module.exports = getStatusFunc;
