const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const mkdirp = require('mkdirp');
const glob = require('glob');
const crypto = require('crypto');
const minimatch = require('minimatch');
const template = require('lodash-template');
const c = require('chalk');
const log = require('single-line-log').stdout;
const pad = require('pad');

const writeNewLine = (newline) => {
  if (newline) { console.log(); } // eslint-disable-line no-console
}

const utils = {

  log: (message, newline = true) => {
    log(message);
    writeNewLine(newline);
  },

  logProcessing: (message, newline = false) => {
    log(`${pad(c.gray('processing'), 13)}\t${message}`);
    writeNewLine(newline);
  },

  logResult: (label, message, color = 'gray', newline = true) => {
    log(`${pad(c[color](label), 13)}\t${message}`);
    writeNewLine(newline);
  },

  logError: (err, newline = true) => {
    log(`${c.red('Error')} ${err.message}`);
    writeNewLine(newline);
  },

  resolveConfig: (file) => {
    return path.resolve(file || 'losant.yml');
  },

  loadConfig: (file) => {
    const f = utils.resolveConfig(file);
    const config = yaml.safeLoad(fs.readFileSync(f));
    config.file = file;
    return config;
  },

  saveConfig: (file, config) => {
    const conf = yaml.safeDump(config);
    const f = utils.resolveConfig(file);
    fs.writeFileSync(f, conf);
    return f;
  },

  isFileNewer: (file, date) => {
    if (!fs.existsSync(file)) { return false; }
    const stats = fs.statSync(file);
    return stats.mtime.getTime() > date.getTime();
  },

  loadLocalMeta: (type) => {
    const dir = path.resolve('.losant');
    const mapFile = path.resolve(dir, `${type}.yml`);
    return fs.existsSync(mapFile) ? yaml.safeLoad(fs.readFileSync(mapFile)) : null;
  },

  saveLocalMeta: (type, meta) => {
    const dir = path.resolve('.losant');
    const mapFile = path.resolve(dir, `${type}.yml`);
    mkdirp(dir);
    fs.writeFileSync(mapFile, yaml.safeDump(meta));
    return mapFile;
  },

  checksum: (str) => {
    return crypto.createHash('md5')
      .update(str, 'utf8')
      .digest('hex');
  },

  getLocalStatus: (dir, pattern, type) => {
    const status = [];
    const meta = utils.loadLocalMeta(type) || {};
    const metaFiles = new Set(Object.keys(meta));
    const files = glob.sync(path.resolve(dir) + pattern);
    files.forEach((file) => {
      const relFile = path.relative('.', file);
      metaFiles.delete(relFile);
      const id = meta[relFile] ? meta[relFile].id : undefined;
      const stats = fs.statSync(file);
      if (stats.isDirectory()) { return; }
      const stat = {
        id: id,
        file: relFile,
        size: stats.size,
        name: path.basename(relFile, path.extname(pattern)),
        origModTime: meta[relFile] ? Math.trunc(meta[relFile].localTime / 1000): undefined,
        localModTime: Math.trunc(stats.mtime.getTime() / 1000),
        origMd5: meta[relFile] ? meta[relFile].md5 : undefined,
        localMd5: utils.checksum(fs.readFileSync(file))
      };
      if (!stat.id) {
        stat.status = 'added';
      } else if (stat.localModTime !== stat.origModTime && stat.localMd5 !== stat.origMd5) {
        stat.status = 'modified';
      } else {
        stat.status = 'unmodified';
      }
      status.push(stat);
    });
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
    return status.sort((a, b) => {
      if (a.file < b.file) { return -1; }
      if (a.file > b.file) { return 1; }
      return 0;
    });
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
    return status.sort((a, b) => {
      if (a.file < b.file) { return -1; }
      if (a.file > b.file) { return 1; }
      return 0;
    });
  }

};

module.exports = utils;
