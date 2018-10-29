const path = require('path');
const findFile = require('find-file-recursively-up');
const { promisify } = require('util');
const findFileP = promisify(findFile);
const yaml = require('js-yaml');
const mkdirp = require('mkdirp');
const glob = require('glob');
const crypto = require('crypto');
const minimatch = require('minimatch');
const template = require('lodash-template');
const c = require('chalk');
const ssLog = require('single-line-log');
const pad = require('pad');
const { keyBy, prop, merge } = require('omnibelt');
const CONFIG_DIR = '.losant';
const configName = (file) => {
  return file || '.losant.yml';
};
const resolveUserConfig = () => {
  return path.resolve(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, `${CONFIG_DIR}/.credentials.yml`);
};
const resolveConfig = (file) => {
  return path.resolve('./', CONFIG_DIR, configName(file));
};
const lockfile = require('proper-lockfile');
const { writeFile, pathExists, readFile, stat, ensureFile } = require('fs-extra');
const order = (status) => {
  return status.sort((a, b) => {
    if (a.file < b.file) { return -1; }
    if (a.file > b.file) { return 1; }
    return 0;
  });
};

const utils = {

  singular: (str) => { return str.substr(0, str.length - 1); },

  plural: (str) => {
    if (str[str.length - 1] !== 's') {
      str = `${str}s`;
    }
    return str;
  },

  mapById: (list) => {
    return keyBy(prop('id'), list);
  },

  setDir: (command) => {
    if (command.dir) {
      process.chdir(command.dir);
    }
  },

  log: (message, newline = true) => {
    ssLog.stdout(message);
    if (newline) { console.log(); } // eslint-disable-line no-console
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

  loadUserConfig: async () => {
    const f = resolveUserConfig();
    await ensureFile(f);
    const config = yaml.safeLoad(await readFile(f)) || {};
    if (!config) {
      utils.logError('User Configuration file missing, run losant sign-in to generate this file.');
      process.exit();
    }
    return config;
  },

  loadApplicationConfig: async (file) => {
    const f = configName(file);
    let foundFile = resolveConfig(file);
    if (!(await pathExists(foundFile))) {
      foundFile = await findFileP(`${CONFIG_DIR}/${f}`);
    }
    if (!foundFile) {
      utils.logError('Configuration file missing for this directory, run losant configure to generate this file.');
      return;
    }
    let config = {};
    if (await utils.lockConfig(foundFile)) {
      config = yaml.safeLoad(await readFile(foundFile));
      config.file = file;
    }
    return config;
  },

  loadConfig: async (file) => {
    const appConfig = await utils.loadApplicationConfig(file);
    const userConfig = await utils.loadUserConfig(file);
    return merge(userConfig, appConfig);
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
    mkdirp(dir);
    await writeFile(mapFile, yaml.safeDump(meta));
    return mapFile;
  },

  checksum: (str) => {
    return crypto.createHash('md5')
      .update(str, 'utf8')
      .digest('hex');
  },

  getLocalStatus: async (type, dir, pattern) => {
    const status = [];
    const meta = await utils.loadLocalMeta(type) || {};
    const metaFiles = new Set(Object.keys(meta));
    // TODO fix bug...when trying to upload a "deleted" file
    const files = glob.sync(path.resolve(`${dir}/${pattern}`));
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
        name: path.basename(relFile, path.extname(pattern)),
        origModTime: meta[relFile] ? Math.trunc(meta[relFile].localTime): undefined,
        localModTime: Math.trunc(stats.mtime.getTime()),
        origMd5: meta[relFile] ? meta[relFile].md5 : undefined,
        localMd5: utils.checksum(await readFile(file))
      };
      if (!statObj.id) {
        statObj.status = 'added';
      } else if (statObj.localModTime !== statObj.origModTime && statObj.localMd5 !== statObj.origMd5) {
        statObj.status = 'modified';
      } else {
        statObj.status = 'unmodified';
      }
      status.push(statObj);
    }));
    metaFiles.forEach((file) => {
      if (minimatch(file, dir + pattern)) {
        status.push({
          id: meta[file].id,
          file: file,
          name: path.basename(file, path.extname(pattern)),
          origModTime: Math.trunc(meta[file].localTime / 1000),
          localModTime: undefined,
          origMd5: meta[file].md5,
          localMd5: undefined,
          status: 'deleted'
        });
      }
    });
    return order(status);
  },

  getRemoteStatus: async (type, resources, pathTemplate, contentProperty, options = {}) => {
    const status = [];
    const meta = await utils.loadLocalMeta(type) || {};
    const metaById = {};
    const metaIds = new Set();
    Object.keys(meta).forEach((file) => {
      const item = meta[file];
      metaById[item.id] = Object.assign({}, item, { file: file });
      metaIds.add(item.id);
    });
    const compiledTemplate = template(pathTemplate);
    resources.forEach((resource) => {
      metaIds.delete(resource.id);
      const file = compiledTemplate(resource);
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
        origModTime: metaById[resource.id] ? metaById[resource.id].remoteTime: undefined,
        remoteModTime: mtime.getTime(),
        origMd5: metaById[resource.id] ? metaById[resource.id].md5 : undefined,
        remoteMd5
      };
      if (!metaById[resource.id]) {
        statObj.status = 'added';
      } else if (statObj.remoteModTime !== statObj.origModTime && (!statObj.origMd5 || statObj.localMd5 !== statObj.origMd5)) {
        statObj.status = 'modified';
      } else {
        statObj.status = 'unmodified';
      }
      status.push(statObj);
    });
    metaIds.forEach((id) => {
      status.push({
        id: id,
        file: metaById[id].file,
        name: path.basename(metaById[id].file, path.extname(metaById[id].file)),
        origModTime: Math.trunc(metaById[id].file.remoteTime / 1000),
        remoteModTime: undefined,
        origMd5: metaById[id].file.md5,
        localMd5: undefined,
        status: 'deleted'
      });
    });
    return order(status);
  }

};

module.exports = utils;
