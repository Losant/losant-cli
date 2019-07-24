const paginateRequest = require('./paginate-request');
const path   = require('path');
const inquirer = require('inquirer');
const {
  loadConfig,
  getShallowStatus,
  getShallowComparativeStatus,
  logResult,
  logProcessing,
  logError,
  mapById,
  plural
} = require('./utils');
const {
  remove,
  pathExists,
  writeFile,
  ensureDir
} = require('fs-extra');
const { merge, values, isEmpty } = require('omnibelt');
const allSettledSerial = require('./all-settled-serial-p');
const { rollbarLog } = require('./rollbar');

const getExporter = ({
  apiType, commandType, localStatusParams, remoteStatusParams, getData, extraQuery
}) => {
  const download = async (pattern, command = {}, loadedConfig) => {
    let didDownload = false;
    const { apiToken, applicationId, api } = loadedConfig ? loadedConfig : await loadConfig();
    if (!apiToken || !applicationId) { return; }
    let items;
    try {
      let query = { applicationId };
      if (extraQuery) {
        query = merge(query, extraQuery);
      }
      items = await paginateRequest(api[apiType].get, query);
    } catch (e) {
      return logError(e);
    }
    const itemsById = mapById(items);
    const { remoteStatusByFile, localStatusByFile } = await getShallowStatus({
      items,
      remoteStatusParams,
      localStatusParams,
      dir: commandType
    });
    if (command.dryRun) {
      logResult('DRY RUN');
    }
    if (isEmpty(remoteStatusByFile)) {
      if (!pattern) {
        return logResult('Missing', `No ${plural(commandType)} found to export.`, 'yellow');
      } else {
        return logResult('No Matches', `No ${plural(commandType)} found that match this pattern ${pattern}`, 'yellow');
      }
    }
    const downloadResults = await allSettledSerial(async (remoteStatus) => {
      logProcessing(remoteStatus.file);
      if (!command.force) {
        const localStatus = localStatusByFile[remoteStatus.file];
        const { conflict } = getShallowComparativeStatus(localStatus, remoteStatus);
        if (conflict) {
          const { handleConflict } = await inquirer.prompt([{
            name: 'handleConflict',
            type: 'list',
            message: `The file ${remoteStatus.file} already exists, how do you want to handle this?`,
            choices: [
              { name: 'Do nothing, and resolve the conflict later.', value: null },
              { name: 'Overwrite with the remote data.', value: 'overwrite' },
              { name: 'Ignore the remote data.', value: 'local' }
            ]
          }]);
          if (!handleConflict) {
            return logResult('conflict', remoteStatus.file, 'redBright');
          }
          if (handleConflict === 'local') { return; }
        }
      }
      if (remoteStatus.status === 'missing') {
        if (!command.dryRun) {
          try {
            if (await pathExists(remoteStatus.file)) {
              await remove(remoteStatus.file);
            }
          } catch (e) {
            return logError(`An Error occurred when trying to delete file ${remoteStatus.file} with the message ${e.message}`);
          }
        }
        return logResult('deleted', remoteStatus.file, 'yellow');
      }
      if (!command.dryRun) {
        await ensureDir(path.dirname(remoteStatus.file));
        let data;
        try {
          data = await getData(itemsById[remoteStatus.id], api);
        } catch (e) {
          return logError(`An Error occurred when trying to export data for file ${remoteStatus.file} with the message ${e.message}`);
        }
        try {
          await writeFile(remoteStatus.file, data);
        } catch (e) {
          return logError(`An Error occurred when trying to write the file ${remoteStatus.file} with the message ${e.message}`);
        }
      }
      logResult('exported', remoteStatus.file, 'green');
      didDownload = true;
    }, values(remoteStatusByFile));
    downloadResults.forEach((result) => {
      // this should only occur on unhandled rejections any api error should have already logged and resolved the promise
      if (result.state !== 'fulfilled') {
        rollbarLog(result.reason);
        logError(result.reason);
      }
    });
    return didDownload;
  };
  return download;
};

module.exports = getExporter;
