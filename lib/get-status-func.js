const getApi = require('./get-api');
const paginateRequest = require('./paginate-request');
const {
  loadConfig,
  getRemoteStatus,
  getLocalStatus,
  logError,
  log,
  getComparativeStatus
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
const { merge, keyBy, difference } = require('omnibelt');
const mapByFileId = keyBy((obj) => { return `${obj.file}`; });

const colorifyStatus = (status) => {
  let colorified = statusByColor[status];
  if (!colorified) { colorified = c.gray(status); }
  return colorified;
};

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
      console.error(err);
      logError(err);
      return;
    }
    const allRemoteStatus = await getRemoteStatus(commandType, items, ...remoteStatusParams) || [];
    const remoteStatusById = mapByFileId(allRemoteStatus);
    const allLocalStatus = await getLocalStatus(commandType, commandType, ...localStatusParams);
    const localStatusById = mapByFileId(allLocalStatus);
    const localIds = Object.keys(localStatusById);
    const remoteIds = Object.keys(remoteStatusById);
    const columns = [];
    remoteIds.forEach((id) => {
      const remoteInfo = remoteStatusById[id];
      const localInfo = localStatusById[id];
      const column = [];
      column.push(remoteInfo.name);
      const { remoteStatus, localStatus, conflict } = getComparativeStatus(localInfo, remoteInfo);
      column.push(colorifyStatus(localStatus));
      column.push(colorifyStatus(remoteStatus));
      if (conflict) {
        column.push(conflictRed);
      } else {
        column.push(notConflict);
      }
      columns.push(column);
    });
    const localIdsLeft = difference(localIds, remoteIds);
    localIdsLeft.forEach((id) => {
      const column = [];
      column.push(localStatusById[id].name);
      const { remoteStatus, localStatus } = getComparativeStatus(localStatusById[id]);
      column.push(colorifyStatus(localStatus));
      column.push(colorifyStatus(remoteStatus));
      column.push(notConflict);
      columns.push(column);
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
