const getApi = require('./get-api');
const path = require('path');
const findFile = require('find-file-up');
const yaml = require('js-yaml');
const glob = require('glob');
const crypto = require('crypto');
const minimatch = require('minimatch');
const c = require('chalk');
const ssLog = require('single-line-log');
const pad = require('pad');
const {
  keyBy, prop, mergeRight, isEmpty, keys, union, find, propEq, propOr, mapP
} = require('omnibelt');
const { rollbarLog } = require('./rollbar');
const CONFIG_DIR = '.losant';
const configName = (file) => {
  return file || '.application.yml';
};
const resolveUserConfig = () => {
  const directory = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  return path.resolve(directory, path.join(`${CONFIG_DIR}`, '.credentials.yml'));
};
const resolveConfig = (file) => {
  return path.resolve('.', CONFIG_DIR, configName(file));
};
const lockfile = require('proper-lockfile');
const {
  writeFile, pathExists, readFile, stat, ensureFile, ensureDir, pathExistsSync
} = require('fs-extra');
const jwt = require('jsonwebtoken');
const inquirer = require('inquirer');

const utils = {

  singular: (str) => { return str && str.substr(0, str.length - 1); },

  plural: (str) => {
    if (str && str[str.length - 1] !== 's') {
      str = `${str}s`;
    }
    return str;
  },

  mapById: (list) => {
    return keyBy(prop('id'), list);
  },

  log: (message, newline = true) => {
    ssLog.stdout(message);
    if (newline && process.env.NODE_ENV !== 'test') { console.log(); } // eslint-disable-line no-console
  },

  logProcessing: (message, newline = true) => {
    utils.log(`${pad(c.gray('processing'), 13)}\t${message}`, newline);
  },

  logResult: (label, message, color, newline = true) => {
    const colorLabel = c[color] ? c[color] : c.gray; // if they do not put in a valid color it can explodes
    let str = `${pad(colorLabel(label), 13)}`;
    if (message) { str += `\t${message}`; }
    utils.log(str, newline);
  },

  logError: (err, newline = true) => {
    // err can be either an error object or a string
    utils.log(`${c.redBright('Error')} ${err && err.message ? err.message : err}`, newline);
  },

  loadUserConfig: async (checkIsEmpty = true) => {
    const f = resolveUserConfig();
    await ensureFile(f);
    let config = yaml.safeLoad(await readFile(f)) || {};
    if (config.apiToken) {
      const token = config.apiToken;
      config = {};
      const decoded = jwt.decode(token, { complete: true }) || {};
      if (decoded.payload && decoded.payload.iss) {
        if (decoded.payload.iss === 'api.getstructure.io') {
          decoded.payload.iss = 'api.losant.com';
        }
        const defaultUrl = `https://${decoded.payload.iss}`;
        const api = await getApi({ apiToken: token, url: defaultUrl });
        let wlInfo;
        try {
          wlInfo = await api.request({ method: 'get', url: '/whitelabels/domain' });
        } catch (e) {
          // could not get the white-label...
          // just throw away the token they need to re login.
        }
        if (wlInfo) {
          config[defaultUrl] = {
            apiToken: token,
            endpointDomain: wlInfo.endpointDomain,
            appUrl: wlInfo.appUrl
          };
          await writeFile(f, yaml.safeDump(config));
        }
      }
    }
    if (checkIsEmpty && isEmpty(config)) {
      utils.logError('User Configuration file missing, run losant login to generate this file.');
      process.exit(1);
    }
    return config;
  },

  getApiURL: async (userConfig) => {
    const apiKeys = keys(userConfig);
    if (apiKeys.length === 1) {
      return apiKeys[0];
    }
    const { url } = await inquirer.prompt([{
      type: 'list',
      name: 'url',
      message: 'Choose an API url:',
      choices: apiKeys
    }]);
    return url;
  },

  loadApplicationConfig: async (file, userConfig) => {
    const f = configName(file);
    let foundFile = resolveConfig(file);
    if (!(await pathExists(foundFile))) {
      foundFile = await findFile(`${CONFIG_DIR}/${f}`);
    }
    if (!foundFile) {
      utils.logError('Configuration file missing for this directory, run losant configure to generate this file.');
      return;
    }
    const parsedPath = path.parse(foundFile);
    const cwd = path.parse(parsedPath.dir).dir;
    process.chdir(cwd);
    let config = {};
    if (await utils.lockConfig(foundFile)) {
      config = yaml.safeLoad(await readFile(foundFile)) || {};
      if (isEmpty(config)) {
        utils.logError('Configuration file missing for this directory, run losant configure to generate this file.');
        return;
      }
      if (!config.apiUrl) {
        config.apiUrl = await utils.getApiURL(userConfig);
        await writeFile(foundFile, yaml.safeDump(config));
      }
      config.file = foundFile;
    }
    return config;
  },

  loadConfig: async (file) => {
    let userConfig = await utils.loadUserConfig();
    const appConfig = await utils.loadApplicationConfig(file, userConfig);
    // this is handled by all other commands to return early if this function returns an empty object
    // the commands assume something was logged
    // originally this path was taken to make testing easier.
    // TODO UPDATE how errors are logged and either rollbar and exit or continue if it's tests running.
    if (!appConfig) { return {}; }
    // backwards compatible in case the current applicationConfig does not have an apiUrl
    const apiKey = appConfig.apiUrl;
    userConfig = userConfig[apiKey];
    if (!userConfig || isEmpty(userConfig)) {
      utils.logError(`Could not find log in information for API ${apiKey}, please login again.`);
      process.exit(1);
    }
    const api = await getApi({ url: apiKey, apiToken: userConfig.apiToken });
    const config = mergeRight(userConfig, appConfig);
    config.api = api;
    return config;
  },

  unlockConfig: async (file) => {
    let f = configName(file);
    let foundFile = resolveConfig(file);
    if (!(await pathExists(foundFile))) {
      foundFile = await findFile(`${CONFIG_DIR}/${f}`);
    }
    f = resolveConfig(file);
    if (await lockfile.check(f)) {
      await lockfile.unlock(f);
    }
  },
  // this should only be used on closing events, use unlockConfig otherwise
  unlockConfigSync: (file) => {
    let f = configName(file);
    let foundFile = resolveConfig(file);
    if (!pathExistsSync(foundFile)) {
      foundFile = findFile.sync(`${CONFIG_DIR}/${f}`);
    }
    if (!foundFile) { return; }
    f = resolveConfig(foundFile);
    if (pathExistsSync(f) && lockfile.checkSync(f)) {
      lockfile.unlockSync(f);
    }
  },

  lockConfig: async (file) => {
    const f = resolveConfig(file);
    let isLocked = false;
    if (!(await pathExists(f))) {
      await ensureFile(f);
    }
    if (!(await lockfile.check(f))) {
      await lockfile.lock(f);
      isLocked = true;
    } else {
      utils.logError(`${f} is already locked by another process running.`);
    }
    return isLocked;
  },

  saveUserConfig: async (config) => {
    const userConfig = await utils.loadUserConfig(false);
    config = mergeRight(userConfig, config);
    const conf = yaml.safeDump(config);
    const f = resolveUserConfig();
    await ensureFile(f);
    await writeFile(f, conf);
    return f;
  },

  saveConfig: async (file, config) => {
    const conf = yaml.safeDump(config);
    const f = resolveConfig(file);
    await ensureFile(f);
    await writeFile(f, conf);
    return f;
  },

  isFileNewer: async (file, date) => {
    if (!await pathExists(file)) { return false; }
    const stats = await stat(file);
    return stats.mtime.getTime() > date.getTime();
  },

  loadLocalMeta: async (type) => {
    const dir = path.resolve('.losant');
    const mapFile = path.resolve(dir, `${type}.yml`);
    return (await pathExists(mapFile)) ? yaml.safeLoad(await readFile(mapFile)) : null;
  },

  saveLocalMeta: async (type, meta) => {
    const dir = path.resolve('.losant');
    const mapFile = path.resolve(dir, `${type}.yml`);
    await ensureDir(dir);
    await writeFile(mapFile, yaml.safeDump(meta));
    return mapFile;
  },

  checksum: (str) => {
    return crypto.createHash('md5')
      .update(str, 'utf8')
      .digest('hex');
  },

  getShallowLocalStatus: async (dir, globPattern) => {
    const dirPattern = path.resolve(path.join(dir, globPattern));
    const files = glob.sync(dirPattern);
    return new Map(await mapP(async (file) => {
      return [path.relative('.', file), true];
    }, files));
  },

  getLocalStatus: async (type, dir, globPattern) => {
    if (!dir) { dir = type; } // the default pattern is that the directory matches the command type. e.g. files files/
    const statusByFile = {};
    const meta = await utils.loadLocalMeta(type) || {};
    const metaFiles = new Set(keys(meta));
    const dirPattern = path.resolve(path.join(dir, globPattern));
    const files = glob.sync(dirPattern);
    await Promise.all(files.map(async (file) => {
      const relFile = path.relative('.', file);
      metaFiles.delete(relFile);
      const id = meta[relFile] ? meta[relFile].id : undefined;
      const stats = await stat(file);
      if (stats.isDirectory()) { return; }
      const statObj = {
        id: id,
        file: relFile,
        size: stats.size,
        name: meta[relFile] ? meta[relFile].name : path.basename(relFile, path.extname(globPattern)),
        origModTime: meta[relFile] ? Math.trunc(meta[relFile].localTime): undefined,
        localModTime: Math.trunc(stats.mtime.getTime()),
        origMd5: meta[relFile] ? meta[relFile].md5 : undefined,
        localMd5: utils.checksum(await readFile(relFile))
      };
      if (!statObj.id) {
        statObj.status = 'added';
      } else if (statObj.localMd5 !== statObj.origMd5) {
        statObj.status = 'modified';
      } else {
        statObj.status = 'unmodified';
      }
      statusByFile[relFile] = statObj;
    }));
    metaFiles.forEach((file) => {
      statusByFile[file] = {
        name: meta[file].name,
        id: meta[file].id,
        file: file,
        origModTime: Math.trunc(meta[file].localTime / 1000),
        localModTime: undefined,
        origMd5: meta[file].md5,
        localMd5: undefined,
        status: 'deleted'
      };
    });
    return statusByFile;
  },

  getShallowRemoteStatus: async (localFiles, resources, getFilePath) => {
    if (!resources) { return {}; }
    const statusByFile = {};
    resources.forEach((resource) => {
      const statObj = {
        id: resource.id,
        name: resource.name,
        status: 'found'
      };
      const file = path.normalize(getFilePath(resource, { currentFileMap: localFiles, skipIdCheck: true }));
      statObj.file = file;
      statusByFile[file] = statObj;
      localFiles.delete(file);
    });
    const files = Array.from(localFiles.keys());
    files.forEach((file) => {
      statusByFile[file] = {
        file,
        status: 'missing'
      };
    });
    return statusByFile;
  },

  getRemoteStatus: async (type, resources, getFilePath, contentProperty, options = {}) => {
    const statusByFile = {};
    const meta = await utils.loadLocalMeta(type) || {};
    const metaByFile = new Map();
    const metaFiles = new Set();
    const currentFiles = new Set(keys(meta));
    currentFiles.forEach((file) => {
      const item = meta[file];
      metaByFile.set(file, Object.assign({}, item, { file: file }));
      metaFiles.add(file);
    });
    const newFilesSet = new Set();

    resources.forEach((resource) => {
      const file = path.normalize(getFilePath(resource, { newFilesSet, currentFileMap: metaByFile }));
      metaFiles.delete(file);
      const mtime = new Date(resource.lastUpdated);
      let remoteMd5;
      if (contentProperty) {
        remoteMd5 = resource[contentProperty];
        if (!options.skipMd5Creation) {
          remoteMd5 = utils.checksum(remoteMd5);
        }
      }
      const statObj = {
        id: resource.id,
        file: file,
        name: resource.name,
        origModTime: metaByFile.has(file) ? metaByFile.get(file).remoteTime: undefined,
        remoteModTime: mtime.getTime(),
        origMd5: metaByFile.has(file) ? metaByFile.get(file).md5 : undefined,
        remoteMd5
      };
      if (!metaByFile.has(file)) {
        newFilesSet.add(file);
        statObj.status = 'added';
      } else if (statObj.remoteMd5 !== statObj.origMd5) {
        statObj.status = 'modified';
      } else {
        statObj.status = 'unmodified';
      }
      statusByFile[file] = statObj;
    });
    // anything left over are existing files that where no longer found in the API
    metaFiles.forEach((file) => {
      const metaObj = metaByFile.get(file);
      statusByFile[file] = {
        id: metaObj.id,
        file,
        name: metaObj.name || path.basename(file, type !== 'files' ? path.extname(file) : undefined),
        origModTime: Math.trunc(metaObj.remoteTime / 1000),
        remoteModTime: undefined,
        origMd5: metaObj.md5,
        remoteMd5: undefined,
        status: 'deleted'
      };
    });
    return statusByFile;
  },

  getComparativeStatus: (localInfo, remoteInfo) => {
    const remoteStatus = !remoteInfo || isEmpty(remoteInfo) ? 'missing' : remoteInfo.status;
    const localStatus = !localInfo || isEmpty(localInfo) ? 'missing' : localInfo.status;
    let conflict = false;
    if (
      (localStatus === 'deleted' && remoteStatus === 'modified') ||
      (remoteStatus === 'deleted' && localStatus === 'modified')
    ) {
      conflict = true;
    }
    if (
      (localStatus === 'added' && remoteStatus === 'added') ||
      (localStatus === 'modified' && remoteStatus === 'modified')
    ) {
      if (localInfo.localMd5 !== remoteInfo.remoteMd5) {
        conflict = true;
      }
    }
    // if any of the following are the case we need to rollbar that state because the state _should_ never happen...
    if (
      (localStatus === 'added' && (remoteStatus === 'removed' || remoteStatus === 'unmodified' || remoteStatus === 'modified')) ||
      ((localStatus === 'removed' || localStatus === 'unmodified' || localStatus === 'modified') && (remoteStatus === 'added' || remoteStatus === 'missing')) ||
      (localStatus === 'missing' && remoteStatus !== 'added')
    ) {
      rollbarLog({ message: 'State doesn\'t make sense', custom: { remoteStatus, localStatus } });
    }

    return { localStatus, remoteStatus, conflict };
  },
  // this function will not work for experiences...just a heads up
  getShallowStatus: async ({ items, remoteStatusParams, localStatusParams, dir, pattern }) => {
    const localFiles = await utils.getShallowLocalStatus(dir, ...localStatusParams);
    const remoteStatusByFile = await utils.getShallowRemoteStatus(localFiles, items, ...remoteStatusParams);

    if (pattern) {
      const dirPattern = path.join(dir, pattern);
      const allFiles = union(keys(remoteStatusByFile), keys(localFiles));
      const matchPattern = new RegExp(`^${dirPattern}.*$`, 'i');
      allFiles.forEach((file) => {
        if (!matchPattern.test(file)) {
          delete remoteStatusByFile[file];
          delete localFiles[file];
        }
      });
    }

    return { localStatusByFile: localFiles, remoteStatusByFile };
  },

  getStatus: async ({
    commandType, items, remoteStatusParams, localStatusParams, pattern, type, dir
  }) => {
    const [ remoteStatusByFile, localStatusByFile ] = await Promise.all([
      utils.getRemoteStatus(commandType, items, ...remoteStatusParams),
      utils.getLocalStatus(commandType, commandType, ...localStatusParams)
    ]);

    if (commandType === 'experience' && (type || pattern)) {
      pattern = path.join(path.sep, type || '**', pattern || '*.hbs');
    }
    if (pattern) {
      if (!dir) { dir = commandType; }
      const dirPattern = path.join(dir, pattern);
      const allFiles = union(keys(remoteStatusByFile), keys(localStatusByFile));
      allFiles.forEach((file) => {
        if (!minimatch(file, dirPattern)) {
          delete remoteStatusByFile[file];
          delete localStatusByFile[file];
        }
      });
    }

    return { localStatusByFile, remoteStatusByFile };
  },

  isValidExperienceOptions: (command) => {
    if (!command.type) { return true; }
    const newType = utils.plural(command.type);
    if (!(/^(layouts|components|pages)$/i).test(newType)) {
      utils.logError(`Invalid Type: ${command.type}, only valid views types are layouts, pages and components.`);
      return false;
    }
    command.type = newType;
    return true;
  },
  hasBootstrapped: (application) => {
    const result = find(propEq('name', 'experience'), propOr([], 'ftueTracking', application));
    if (result && result.version >= 2) {
      return result;
    }
  }

};

module.exports = utils;
