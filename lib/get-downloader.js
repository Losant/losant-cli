const getApi = require('./get-api');
const paginateRequest = require('./paginate-request');
const path   = require('path');
const serialForEachP = require('./serial-for-each-p');
const inquirer = require('inquirer');
const {
  loadConfig,
  getRemoteStatus,
  getLocalStatus,
  loadLocalMeta,
  saveLocalMeta,
  checksum,
  logResult,
  logProcessing,
  logError,
  mapById,
  getComparativeStatus
} = require('./utils');
const {
  remove,
  writeFile,
  pathExists,
  ensureDir
} = require('fs-extra');
const { merge, values, isEmpty } = require('omnibelt');

// filterFunc -> item and pattern
const getDownloader = ({
  apiType, commandType, localStatusParams, remoteStatusParams, getData, curriedFilterFunc, extraQuery
}) => {
  const download = async (pattern, command = {}, loadedConfig) => {
    const filterFunc = curriedFilterFunc(pattern);
    const { apiToken, applicationId } = loadedConfig ? loadedConfig : await loadConfig();
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

    const itemsById = mapById(items);

    const [ remoteStatusByFile, localStatusByFile ] = await Promise.all([
      getRemoteStatus(commandType, items, ...remoteStatusParams),
      getLocalStatus(commandType, commandType, ...localStatusParams)
    ]);
    if (command.dryRun) {
      logResult('DRY RUN');
    }
    if (isEmpty(remoteStatusByFile)) {
      return logResult('Not Found', 'No files to download from this application', 'yellow');
    }
    try {
      await serialForEachP(async (remoteStatus) => {
        logProcessing(remoteStatus.file);
        if (!command.force) {
          const localStatus = localStatusByFile[remoteStatus.file];
          const { conflict } = getComparativeStatus(localStatus, remoteStatus);
          if (conflict) {
            const { handleConfict } = await inquirer.prompt([{
              name: 'handleConfict',
              type: 'list',
              message: `A conflict has been dected in ${remoteStatus.file}, how do you want to handle this?`,
              choices: [
                { name: 'Do nothing, and resolve the conflict later.', value: null },
                { name: 'Overwrite with the remote data.', value: 'overwrite' },
                { name: 'Ignore the remote data.', value: 'local' }
              ]
            }]);
            if (!handleConfict) {
              return logResult('conflict', remoteStatus.file, 'redBright');
            }
            if (handleConfict === 'local') {
              meta[remoteStatus.file] = {
                file: remoteStatus.file,
                id: remoteStatus.id,
                md5: remoteStatus.remoteMd5,
                remoteTime: remoteStatus.remoteModTime,
                localTime: new Date().getTime()
              };
              // since you are resetting the yaml file to make it seem like the remote as not been modified.
              // it will make the local file have modifications that are non-conflicting with the remote file
              return logResult('unmodified', remoteStatus.file);
            }
          }
        }
        if (remoteStatus.status === 'unmodified') {
          return logResult('unmodified', remoteStatus.file);
        }
        if (remoteStatus.status === 'deleted') {
          if (!command.dryRun) {
            if (await pathExists(remoteStatus.file)) {
              await remove(remoteStatus.file);
            }
            delete meta[remoteStatus.file];
          }
          return logResult('deleted', remoteStatus.file, 'yellow');
        }
        if (!command.dryRun) {
          await ensureDir(path.dirname(remoteStatus.file));
          const data = await getData(itemsById[remoteStatus.id]);
          await writeFile(remoteStatus.file, data);
          meta[remoteStatus.file] = {
            file: remoteStatus.file,
            id: remoteStatus.id, // can probably remove
            md5: checksum(data),
            remoteTime: remoteStatus.remoteModTime,
            localTime: new Date().getTime()
          };
        }
        logResult('downloaded', remoteStatus.file, 'green');
      },  values(remoteStatusByFile));
    } catch (err) {
      logError(err);
    } finally {
      await saveLocalMeta(commandType, meta);
    }
  };
  return download;
};

module.exports = getDownloader;
