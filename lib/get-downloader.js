const getApi = require('./get-api');
const paginateRequest = require('./paginate-request');
const path   = require('path');
const {
  loadConfig,
  getRemoteStatus,
  getLocalStatus,
  loadLocalMeta,
  saveLocalMeta,
  checksum,
  logResult,
  logError,
  mapById
} = require('./utils');
const {
  remove,
  writeFile,
  pathExists,
  ensureDir
} = require('fs-extra');
const { merge } = require('omnibelt');

// filterFunc -> item and pattern
const getDownloader = ({
  apiType, commandType, localStatusParams, remoteStatusParams, getData, curriedFilterFunc, isConflictDetected, extraQuery
}) => {
  const download = async (pattern, command) => {
    const filterFunc = curriedFilterFunc(pattern);
    const { apiToken, applicationId } = await loadConfig();
    if (!apiToken || !applicationId) { return; }
    const api = await getApi({ apiToken });
    const meta = await loadLocalMeta(commandType) || {};
    let items;
    try {
      let query = { applicationId };
      if (extraQuery) {
        query = merge(query, extraQuery);
      }
      items = await paginateRequest(api[apiType].get, query);
    } catch (e) {
      await saveLocalMeta(commandType, meta);
      return logError(e);
    }
    if (pattern) {
      items = items.filter(filterFunc);
    }

    // map items to ids
    const itemsById = mapById(items);
    const localStatus = await getLocalStatus(commandType, commandType, ...localStatusParams);
    const localStatusById = {};
    const newLocalFiles = new Set();
    localStatus.forEach((item) => {
      if (item.id) {
        localStatusById[item.id] = item;
      } else {
        newLocalFiles.add(item.file);
      }
    });
    const remoteStatus = await getRemoteStatus(commandType, items, ...remoteStatusParams);
    if (command.dryRun) {
      logResult('DRY RUN');
    }
    const downloadPromises = [];
    if (!remoteStatus.length && !items.length) {
      return logResult('Not Found', 'No files to download from this application', 'yellow');
    }
    remoteStatus.forEach((item) => {
      // if forcing the update ignore conflicts and local modifications
      if (!command.force) {
        if (item.status === 'unmodified') {
          logResult('unmodified', item.file);
          return;
        }
        if (isConflictDetected && isConflictDetected(item, localStatusById[item.id], newLocalFiles)) {
          logResult('conflict', item.file, 'redBright');
          return;
        }

      }
      if (item.status === 'deleted') {
        if (command.dryRun) {
          return logResult('deleted', item.file, 'yellow');
        }
        const deleteFunc = async () => {
          if (await pathExists(item.file)) {
            await remove(item.file);
          }
          delete meta[item.file];
          logResult('deleted', item.file, 'yellow');
        };
        downloadPromises.push(deleteFunc());
      } else {
        if (!command.dryRun) {
          const downloadPromise = async () => {
            const mtime = new Date(item.remoteModTime);
            await ensureDir(path.dirname(item.file));
            const data = await getData(itemsById[item.id], item);
            await writeFile(item.file, data);
            meta[item.file] = {
              id: item.id,
              md5: checksum(data),
              remoteTime: mtime.getTime(),
              localTime: new Date().getTime()
            };
            logResult('downloaded', item.file, 'green');
          };
          downloadPromises.push(downloadPromise());
        } else {
          logResult('downloaded', item.file, 'green');
        }
      }
    });
    try {
      await Promise.all(downloadPromises);
    } catch (err) {
      logError(err);
    } finally {
      await saveLocalMeta(commandType, meta);
    }
  };
  return download;
};

module.exports = getDownloader;
