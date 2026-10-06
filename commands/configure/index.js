import error from 'error/typed.js';
import { Command } from 'commander';
import { mergeRight, findIndex, propEq } from 'omnibelt';
import getApi from '../../lib/get-api.js';
import c from 'chalk';
import retryP from '../../lib/retryP.js';
import fsExtra from 'fs-extra';
import getDownloadParams from '../../lib/get-download-params.js';
import getExportParams from '../../lib/get-export-params.js';
import getDownloader from '../../lib/get-downloader.js';
import getExporter from '../../lib/get-exporter.js';
import experienceBootstrap from '../../lib/experience-bootstrap.js';
import inquirer from 'inquirer';
import utils from '../../lib/utils.js';

const program = new Command('losant configure');
const { ensureDir } = fsExtra;
const params = getDownloadParams;
const dtParams = getExportParams.dataTables;
const experienceDownload = getDownloader(params.experience);
const filesDownload = getDownloader(params.files);
const dataTablesExport = getExporter(dtParams);
const {
  saveConfig, logError, logResult, log, loadUserConfig, saveLocalMeta, hasBootstrapped, getApiURL
} = utils;

const DIRECTORIES_TO_GENERATE = [
  'dataTables',
  'files',
  'experience'
];

const LOCAL_META_FILES = [
  'files',
  'experience'
];

const getApplicationFunc = (api, appUrl) => {
  return async () => {
    const { filter } = await inquirer.prompt([
      { type: 'input', name: 'filter', message: 'Enter an Application Name:' }
    ]);
    let applicationInfo;
    const applications = await api.applications.get({ filterField: 'name', filter });
    if (applications.count > 25) {
      throw error({ type: 'TooMany', message: 'Too many applications found to list through.' });
    } else if (applications.count === 0) {
      throw error({ type: 'NotFound', message: `No applications found with the filter ${filter}` });
    } else if (applications.count === 1) {
      applicationInfo = applications.items[0];
    } else {
      const nameToId = {};
      const choices = applications.items.map((appInfo) => {
        const key = `${appInfo.name} | ${appInfo.organizationName || 'My Sandbox'} | ${appUrl}/applications/${appInfo.id}`;
        nameToId[key] = appInfo;
        return key;
      });
      choices.push('none of these, search again');
      const { name } = await inquirer.prompt([{
        type: 'list',
        name: 'name',
        message: `Several applications were found with the name ${filter}, choose one:`,
        choices
      }]);
      if (name === 'none of these, search again') {
        throw error({ type: 'ForceRetry', message: 'user typed in wrong filter' });
      }
      applicationInfo = nameToId[name];
    }
    return applicationInfo;
  };
};

const printRetry = (err) => {
  if (err.message === 'Invalid access token') {
    return true;
  }
  if (err.type === 'ForceRetry') {
    log('Please try a different application name.');
  } else {
    if (!err.type) { return true; }
    if (err.message) {
      log(err.message);
    }
    log('Please try again');
  }
  return false;
};

const setSkippedExperience = (api, application) => {
  if (!application.ftueTracking) {
    application.ftueTracking = [];
  }
  const index = findIndex(propEq('experience', 'name'), application.ftueTracking);
  const track = { name: 'experience', version: 3, status: 'skipped' };
  if (index === -1) {
    application.ftueTracking.push(track);
  } else {
    application.ftueTracking[index] = track;
  }
  return api.application.patch({ applicationId: application.applicationId, application: { ftueTracking: application.ftueTracking } });
};

program
  .description('Configures and associates a directory on disk to represent one of your Losant applications and its resources.')
  .action(async (command) => {
    let userConfig = await loadUserConfig() || {};
    const apiUrl = await getApiURL(userConfig);
    await Promise.all(DIRECTORIES_TO_GENERATE.map((dir) => { return ensureDir(dir); }));
    await Promise.all(LOCAL_META_FILES.map((type) => { return saveLocalMeta(type, {}); }));
    userConfig = userConfig[apiUrl];
    const api = await getApi({ url: apiUrl, apiToken: userConfig.apiToken });
    const getApplication = getApplicationFunc(api, userConfig.appUrl);
    let appInfo;
    try {
      appInfo = await retryP(getApplication, printRetry);
    } catch (e) {
      if (e.message === 'Invalid access token') {
        return log('Invalid access token, please re-login in by running "losant login".');
      }
      throw e;
    }
    const config = { applicationId: appInfo.id, applicationName: appInfo.name, apiUrl };
    try {
      const file = await saveConfig(command.config, config);
      logResult('success', `Configuration written to ${c.bold(file)} for the application ${appInfo.name}`, 'green');
    } catch (e) {
      logError(`Failed to write configuration: ${c.bold(e.message)}`);
    }
    const loadedConfig = mergeRight(userConfig, config);
    loadedConfig.api = api;
    try {
      const downloaded = await experienceDownload(null, {}, {}, loadedConfig);
      if (downloaded) {
        logResult('success', 'Downloaded all experience resources!', 'green');
      } else {
        if (!hasBootstrapped(appInfo)) {
          const { shouldBootstrap } = await inquirer.prompt([{
            type: 'confirm',
            name: 'shouldBootstrap',
            message: `Do you want to bootstrap your experience for application ${appInfo.name}?`
          }]);
          if (shouldBootstrap) {
            await experienceBootstrap({}, {}, loadedConfig, appInfo);
          } else {
            await setSkippedExperience(api, appInfo);
          }
        }
      }
    } catch (e) {
      console.error(e);
      logError('Failed to download experience.');
    }
    try {
      const { canDownloadFiles } = await inquirer.prompt([{ type: 'confirm', name: 'canDownloadFiles', message: 'Download files now?' }]);
      if (canDownloadFiles) {
        const downloadedFiles = await filesDownload(null, {}, {}, loadedConfig);
        if (downloadedFiles) {
          logResult('success', 'Downloaded all of files!', 'green');
        }
      }
    } catch (e) {
      console.error(e);
      logError('Failed to download files.');
    }
    try {
      const { canExportDataTables } = await inquirer.prompt([{ type: 'confirm', name: 'canExportDataTables', message: 'Export data tables now?' }]);
      if (canExportDataTables) {
        const exportedTables = await dataTablesExport(null, {}, {}, loadedConfig);
        if (exportedTables) {
          logResult('success', 'Exported all data tables!', 'green');
        }
      }
    } catch (e) {
      console.error(e);
      logError('Failed to export data tables.');
    }
    log('Configuration completed! :D');
  });

export default program;
