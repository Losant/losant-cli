const path = require('path');
const findFile = require('find-file-up');
const getApi = require('./get-api');
const yaml = require('js-yaml');
const glob = require('glob');
const crypto = require('crypto');
const minimatch = require('minimatch');
const template = require('lodash-template');
const c = require('chalk');
const ssLog = require('single-line-log');
const pad = require('pad');
const {
  keyBy, prop, merge, isEmpty, keys, union, find, propEq, propOr, mergeRight, has
} = require('omnibelt');
const { rollbarLog } = require('./rollbar');
const CONFIG_DIR = '.losant';
const configName = (file) => {
  return file || '.application.yml';
};
const DEFAULT_URL = process.env.DEFAULT_API_URL;
const resolveUserConfig = () => {
  const directory = process.env.NODE_ENV !== 'test' ? (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) : './';
  return path.resolve(directory, path.join(`${CONFIG_DIR}`, '.credentials.yml'));
};
const resolveConfig = (file) => {
  return path.resolve('.', CONFIG_DIR, configName(file));
};
const lockfile = require('proper-lockfile');
const {
  writeFile, pathExists, readFile, stat, ensureFile, ensureDir, pathExistsSync
} = require('fs-extra');

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

  loadUserConfig: async (key) => {
    const f = resolveUserConfig();
    await ensureFile(f);
    const config = yaml.safeLoad(await readFile(f)) || {};
    if (isEmpty(config)) {
      utils.logError('User Configuration file missing, run losant login to generate this file.');
      process.exit(1);
    }
    if (has('apiToken', config)) {
      config[DEFAULT_URL] = { apiToken: config.apiToken };
      delete config.apiToken;
      await utils.saveUserConfig(config);
    }
    return key ? config[key] : config;
  },

  loadApplicationConfig: async (file) => {
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
      config.file = file;
    }
    return config;
  },

  loadConfig: async (file) => {
    let appConfig = await utils.loadApplicationConfig(file);
    const apiUrl = appConfig && appConfig.apiUrl || DEFAULT_URL;
    const userConfig = await utils.loadUserConfig(apiUrl);
    if (appConfig && (!appConfig.appUrl || !appConfig.endpointDomain)) {
      const { endpointDomain, appUrl } = await utils.getWhitelabel(userConfig.apiToken);
      appConfig = mergeRight(appConfig, { endpointDomain, appUrl, apiUrl });
      utils.saveConfig(appConfig.file, appConfig);
    }
    return merge(userConfig, appConfig);
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
    const f = resolveUserConfig();
    await ensureFile(f);

    let userConfig = yaml.safeLoad(await readFile(f)) || {};
    if (has('apiToken', userConfig)) {
      userConfig[DEFAULT_URL] = { apiToken: userConfig.apiToken };
      delete userConfig.apiToken;
    }
    userConfig = mergeRight(userConfig, config);
    const newConfig = yaml.safeDump(userConfig);
    await writeFile(f, newConfig);
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

  getLocalStatus: async (type, dir, globPattern) => {
    if (!dir) { dir = type; } // the default pattern is that the directory matches the command type. e.g. files files/
    const statusByFile = {};
    const meta = await utils.loadLocalMeta(type) || {};
    const metaFiles = new Set(Object.keys(meta));
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
        name: path.basename(relFile, path.extname(globPattern)),
        origModTime: meta[relFile] ? Math.trunc(meta[relFile].localTime): undefined,
        localModTime: Math.trunc(stats.mtime.getTime()),
        origMd5: meta[relFile] ? meta[relFile].md5 : undefined,
        localMd5: utils.checksum(await readFile(file))
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
        id: meta[file].id,
        file: file,
        name: path.basename(file, path.extname(globPattern)),
        origModTime: Math.trunc(meta[file].localTime / 1000),
        localModTime: undefined,
        origMd5: meta[file].md5,
        localMd5: undefined,
        status: 'deleted'
      };
    });
    return statusByFile;
  },

  getRemoteStatus: async (type, resources, pathTemplate, contentProperty, options = {}) => {
    const statusByFile = {};
    const meta = await utils.loadLocalMeta(type) || {};
    const metaByFile = {};
    const metaFiles = new Set();
    Object.keys(meta).forEach((file) => {
      const item = meta[file];
      metaByFile[file] = Object.assign({}, item, { file: file });
      metaFiles.add(file);
    });
    const compiledTemplate = template(pathTemplate);
    resources.forEach((resource) => {
      const file = path.normalize(compiledTemplate(resource));
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
        origModTime: metaByFile[file] ? metaByFile[file].remoteTime: undefined,
        remoteModTime: mtime.getTime(),
        origMd5: metaByFile[file] ? metaByFile[file].md5 : undefined,
        remoteMd5
      };
      if (!metaByFile[file]) {
        statObj.status = 'added';
      } else if (statObj.remoteMd5 !== statObj.origMd5) {
        statObj.status = 'modified';
      } else {
        statObj.status = 'unmodified';
      }
      statusByFile[file] = statObj;
    });
    metaFiles.forEach((id) => {
      const file = metaByFile[id].file;
      statusByFile[metaByFile[id].file] = {
        id: id,
        file,
        name: path.basename(metaByFile[id].file, type !== 'files' ? path.extname(metaByFile[id].file) : undefined),
        origModTime: Math.trunc(metaByFile[id].file.remoteTime / 1000),
        remoteModTime: undefined,
        origMd5: metaByFile[id].file.md5,
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
      ((localStatus === 'removed' || localStatus === 'unmodified' || localStatus === 'modified')  && (remoteStatus === 'added' || remoteStatus === 'missing')) ||
      (localStatus === 'missing' && remoteStatus !== 'added')
    ) {
      rollbarLog({ message: 'State doesn\'t make sense', custom: { remoteStatus, localStatus } });
    }

    return { localStatus, remoteStatus, conflict };
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

  getWhitelabel: async (apiToken) => {
    const api  = await getApi({ apiToken });
    return api.request({ method: 'get', url: '/whitelabels/domain' });
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
