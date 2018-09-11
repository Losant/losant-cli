const losant = require('losant-rest');
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
  setDir,
  mapById
} = require('./utils');
const {
  deleteFile,
  writeFile,
  fileStats,
  buildDirectories
} = require('./promise-fs');

// filterFunc -> item and pattern

const getDownloader = (apiType, commandType, localStatusParams, remoteStatusParams, getData, curriedFilterFunc, isConflictDetected) => {
  const download = async (pattern, command) => {
    const filterFunc = curriedFilterFunc(pattern);
    setDir(command);
    const { apiToken, applicationId } = await loadConfig(command.config);
    const api = losant.createClient({ accessToken: apiToken });
    const meta = await loadLocalMeta(commandType) || {};
    let results;
    try {
      results = await api[apiType].get({ applicationId });
    } catch (e) {
      await saveLocalMeta(commandType, meta);
      return logError(e);
    }
    let items = results.items;
    if (pattern) {
      // possibly make filterFunc a curiable function?
      items = items.filter(filterFunc);
    }

    const itemsById = mapById(items);
    // map items to ids
    // TODO use omnibelt
    // items.forEach((item) => { itemsById[item.id] = item; });
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
    const remoteStatus = getRemoteStatus(commandType, items, ...remoteStatusParams);
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
        // should be a promise??
        if (isConflictDetected && isConflictDetected(item, localStatusById[item.id], newLocalFiles)) {
          logResult('conflict', item.file, 'red');
          return;
        }

      }
      if (item.status === 'deleted') {
        if (command.dryRun) {
          return logResult('deleted', item.file, 'yellow');
        }
        const deleteFunc = async () => {
          if (!await fileStats(item.file)) {
            await deleteFile(item.file);
          }
          delete meta[item.file];
          logResult('deleted', item.file, 'yellow');
        };
        downloadPromises.push(deleteFunc());
      } else {
        if (!command.dryRun) {
          const downloadPromise = async () => {
            // const view = viewsById[item.id];
            const mtime = new Date(item.remoteModTime);
            await buildDirectories(path.dirname(item.file));
            // might not need to be awaited...
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
      await saveLocalMeta(commandType, meta);
    } catch (err) {
      // ensure it got saved....
      await saveLocalMeta(commandType, meta);
      logError(err);
    }
  };
  return download;
};

module.exports = getDownloader;
