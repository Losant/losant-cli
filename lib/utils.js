const path = require('path');
const yaml = require('js-yaml');
const mkdirp = require('mkdirp');
const glob = require('glob');
const crypto = require('crypto');
const minimatch = require('minimatch');
const template = require('lodash-template');
const c = require('chalk');
const ssLog = require('single-line-log');
const pad = require('pad');
const { keyBy, prop } = require('omnibelt');
const resolveConfig = (file) => {
  return path.resolve(file || 'losant.yml');
};
const { writeFile, fileExists, readFile, fileStats } = require('./promise-fs');
const order = (status) => {
  return status.sort((a, b) => {
    if (a.file < b.file) { return -1; }
    if (a.file > b.file) { return 1; }
    return 0;
  });
};

const utils = {

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

  logProcessing: (message, newline = false) => {
    utils.log(`${pad(c.gray('processing'), 13)}\t${message}`, newline);
  },

  logResult: (label, message, color, newline = true) => {
    const colorLabel = c[color] ? c[color] : c.gray; // if they do not put in a valid color it can explodes
    utils.log(`${pad(colorLabel(label), 13)}\t${message}`, newline);
  },

  logError: (err, newline = true) => {
    // err can be either an error object or a string
    utils.log(`${c.red('Error')} ${err.message ? err.message : err}`, newline);
  },

  loadConfig: async (file) => {
    const f = resolveConfig(file);
    const config = yaml.safeLoad(await readFile(f));
    config.file = file;
    return config;
  },

  saveConfig: async (file, config) => {
    const conf = yaml.safeDump(config);
    const f = resolveConfig(file);
    await writeFile(f, conf);
    return f;
  },

  isFileNewer: async (file, date) => {
    if (!await fileExists(file)) { return false; }
    const stats = await fileStats(file);
    return stats.mtime.getTime() > date.getTime();
  },
  // todo add a path to where .losant
  loadLocalMeta: async (type) => {
    const dir = path.resolve('.losant');
    const mapFile = path.resolve(dir, `${type}.yml`);
    return await fileExists(mapFile) ? yaml.safeLoad(await readFile(mapFile)) : null;
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
  // changed the interface of this function
  getLocalStatus: async (type, dir, pattern) => {
    const status = [];
    const meta = await utils.loadLocalMeta(type) || {};
    const metaFiles = new Set(Object.keys(meta));
    const files = glob.sync(path.resolve(dir) + pattern);
    await Promise.all(files.map(async (file) => {
      const relFile = path.relative('.', file);
      metaFiles.delete(relFile);
      const id = meta[relFile] ? meta[relFile].id : undefined;
      const stats = await fileStats(file);
      if (stats.isDirectory()) { return; }
      const stat = {
        id: id,
        file: relFile,
        size: stats.size,
        name: path.basename(relFile, path.extname(pattern)),
        origModTime: meta[relFile] ? Math.trunc(meta[relFile].localTime): undefined,
        localModTime: Math.trunc(stats.mtime.getTime()),
        origMd5: meta[relFile] ? meta[relFile].md5 : undefined,
        localMd5: utils.checksum(await readFile(file))
      };
      if (!stat.id) {
        stat.status = 'added';
      } else if (stat.localModTime !== stat.origModTime && stat.localMd5 !== stat.origMd5) {
        stat.status = 'modified';
      } else {
        stat.status = 'unmodified';
      }
      status.push(stat);
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

  getRemoteStatus: (type, resources, pathTemplate, contentProperty) => {
    const status = [];
    const meta = utils.loadLocalMeta(type) || {};
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
      const stat = {
        id: resource.id,
        file: file,
        name: resource.name,
        origModTime: metaById[resource.id] ? metaById[resource.id].remoteTime: undefined,
        remoteModTime: mtime.getTime(),
        origMd5: metaById[resource.id] ? metaById[resource.id].md5 : undefined,
        remoteMd5: contentProperty ? utils.checksum(resource[contentProperty]) : undefined
      };
      if (!metaById[resource.id]) {
        stat.status = 'added';
      } else if (stat.remoteModTime !== stat.origModTime && (!stat.origMd5 || stat.localMd5 !== stat.origMd5)) {
        stat.status = 'modified';
      } else {
        stat.status = 'unmodified';
      }
      status.push(stat);
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
