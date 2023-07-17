const paginateRequest = require('./paginate-request');
const path   = require('path');
const inquirer = require('inquirer');
const {
  loadConfig,
  getStatus,
  loadLocalMeta,
  saveLocalMeta,
  logResult,
  logProcessing,
  logError,
  mapById,
  getComparativeStatus,
  plural,
  isValidExperienceOptions
} = require('./utils');
const {
  remove,
  writeFile,
  pathExists,
  ensureDir
} = require('fs-extra');
const { mergeRight, values, isEmpty } = require('omnibelt');
const allSettledSerial = require('./all-settled-serial-p');
const { rollbarLog } = require('./rollbar');
const { buildMetaDataObj } = require('./meta-data-helpers');

const logUnfilledReasons = (results) => {
  results.forEach((result) => {
    // this should only occur on unhandled rejections any api error should have already logged and resolved the promise
    if (result.state !== 'fulfilled') {
      rollbarLog(result.reason);
      logError(result.reason);
    }
  });
};

const getDownloader = ({
  apiType, commandType, localStatusParams, remoteStatusParams, getData, extraQuery
}) => {
  const download = async (pattern, opts = {}, cmd, loadedConfig) => {
    if (commandType === 'experience' && !isValidExperienceOptions(opts)) { return; }
    let didDownload = false;
    const { apiToken, applicationId, api } = loadedConfig ? loadedConfig : await loadConfig();
    if (!apiToken || !applicationId) { return; }
    let meta = await loadLocalMeta(commandType) || {};
    if (opts.reset && !opts.dryRun) {
      // currently this can only be used by experience
      const { doReset } = await inquirer.prompt([
        { type: 'confirm', name: 'doReset', message: 'This will deleted any local changes made. Are you sure you want to reset your experience?' }
      ]);
      if (!doReset) {
        logResult('experience reset cancelled');
        return;
      }
      const removalResults = await allSettledSerial((file) => {
        return remove(file);
      }, Object.keys(meta));
      logUnfilledReasons(removalResults);
      meta = {};
      await saveLocalMeta(commandType, meta);
      logResult('experience has been cleaned.');

    }
    let items;
    try {
      let query = { applicationId };
      if (extraQuery) {
        query = mergeRight(query, extraQuery);
      }
      items = await paginateRequest(api[apiType].get, query);
    } catch (e) {
      await saveLocalMeta(commandType, meta);
      return logError(e);
    }
    const itemsById = mapById(items);
    const statusInfo = await getStatus({
      commandType,
      items,
      remoteStatusParams,
      localStatusParams,
      pattern,
      type: opts.type
    });

    let localStatusByFile = statusInfo.localStatusByFile;
    const remoteStatusByFile = statusInfo.remoteStatusByFile;

    if (opts.dryRun) {
      logResult('DRY RUN');
      if (opts.reset) {
        // when reseting on dry run...clear the localStatus
        // and fake all unmodified statuses to modified and remove any deleted
        localStatusByFile = {};
        Object.keys(remoteStatusByFile).forEach((file) => {
          if (remoteStatusByFile[file].status === 'unmodified') {
            remoteStatusByFile[file].status = 'modified';
          } else if (remoteStatusByFile[file].status === 'deleted') {
            delete remoteStatusByFile[file];
          }
        });
      }
    }
    if (isEmpty(remoteStatusByFile)) {
      if (!pattern) {
        return logResult('Missing', `No ${plural(commandType)} found to download.`, 'yellow');
      } else {
        return logResult('No Matches', `No ${plural(commandType)} found that match this pattern ${pattern}`, 'yellow');
      }
    }
    const downloadResults = await allSettledSerial(async (remoteStatus) => {
      const file = remoteStatus.file;
      logProcessing(file);
      const localStatus = localStatusByFile[file];
      if (!opts.force) {
        const { conflict } = getComparativeStatus(localStatus, remoteStatus);
        if (conflict) {
          const { handleConflict } = await inquirer.prompt([{
            name: 'handleConflict',
            type: 'list',
            message: `A conflict has been detected in ${file}, how do you want to handle this?`,
            choices: [
              { name: 'Do nothing, and resolve the conflict later.', value: null },
              { name: 'Overwrite with the remote data.', value: 'overwrite' },
              { name: 'Pull remote data, and apply my local changes.', value: 'local' }
            ]
          }]);
          if (!handleConflict) {
            return logResult('conflict', file, 'redBright');
          }
          if (handleConflict === 'local') {
            if (remoteStatus.status !== 'deleted') {
              // faking that the local status and the remote status match so there is no conflict when uploading
              meta[file] = buildMetaDataObj({ remoteStatus });
              return logResult('unmodified', file);
            } else {
              // e.g. make the local a "new" state, since the remote file was deleted.
              delete meta[file];
              return; // purposefully not printing anything out
            }
          }
        }
      }
      if (remoteStatus.status === 'unmodified') {
        meta[file] = buildMetaDataObj({ remoteStatus });
        return logResult('unmodified', file);
      }
      if (remoteStatus.status === 'deleted') {
        if (!opts.dryRun) {
          try {
            if (await pathExists(file)) {
              await remove(file);
            }
          } catch (e) {
            return logError(`An Error occurred when trying to delete file ${file} with the message ${e.message}`);
          }
          delete meta[file];
        }
        return logResult('deleted', file, 'yellow');
      }
      if (!opts.dryRun) {
        await ensureDir(path.dirname(file));
        let data;
        try {
          data = await getData(itemsById[remoteStatus.id], api);
        } catch (e) {
          return logError(`An Error occurred when trying to download data for file ${file} with the message ${e.message}`);
        }
        try {
          await writeFile(file, data);
        } catch (e) {
          return logError(`An Error occurred when trying to write the file ${file} with the message ${e.message}`);
        }
        meta[file] = buildMetaDataObj({ remoteStatus });
      }
      logResult('downloaded', file, 'green');
      didDownload = true;
    }, values(remoteStatusByFile));
    logUnfilledReasons(downloadResults);
    if (!opts.dryRun) {
      await saveLocalMeta(commandType, meta);
    }
    return didDownload;
  };
  return download;
};

module.exports = getDownloader;
