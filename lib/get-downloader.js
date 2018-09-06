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
  logError
} = require('./utils');
const {
  deleteFile,
  writeFile,
  fileStats,
  buildDirectories
} = require('./promise-fs');
// filterFunc -> item and pattern

const getDownloader = (apiType, commandType, getData, curriedFilterFunc, localStatusParams, remoteStatusParams, isConflictDetected) => {
  const download = async (pattern, command) => {
    const filterFunc = curriedFilterFunc(pattern);
    if (command.dir) {
      process.chdir(command.dir);
    }
    const config = loadConfig(command.config);
    const api = losant.createClient({ accessToken: config.apiToken });
    const meta = loadLocalMeta(commandType) || {};
    let results;
    try {
      results = await api[apiType].get({ applicationId: config.applicationId });
    } catch (e) {
      await saveLocalMeta(commandType, meta);
      return logError(e);
    }
    let items = results.items;
    if (pattern) {
      // possibly make filterFunc a curiable function?
      items = items.filter(filterFunc);
    }

    const itemsById = {};
    // map items to ids
    // TODO use omnibelt
    items.forEach((item) => { itemsById[item.id] = item; });
    const localStatus = getLocalStatus(commandType, commandType, ...localStatusParams);
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
      saveLocalMeta('views', meta);
    } catch (err) {
      // ensure it got saved....
      saveLocalMeta('views', meta);
      logError(err);
    }
  };
  return download;
};

module.exports = getDownloader;
