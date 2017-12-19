const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const mkdirp = require('mkdirp')
const glob = require('glob')
const crypto = require('crypto')
const sanitize = require('sanitize-filename')
const minimatch = require('minimatch')

const utils = {

  resolveConfig: (file) => {
    return path.resolve(file || 'losant.yml')
  },

  loadConfig: (file) => {
    const f = utils.resolveConfig(file)
    return yaml.safeLoad(fs.readFileSync(f))
  },

  saveConfig: (file, config) => {
    const c = yaml.safeDump(config)
    const f = utils.resolveConfig(file)
    fs.writeFileSync(f, c)
    return f
  },

  isFileNewer: (file, date) => {
    if (!fs.existsSync(file)) { return false }
    const stats = fs.statSync(file)
    return stats.mtime.getTime() > date.getTime()
  },

  loadLocalMeta: (type) => {
    const dir = path.resolve('.losant')
    const mapFile = path.resolve(dir, `${type}.yml`)
    return fs.existsSync(mapFile) ? yaml.safeLoad(fs.readFileSync(mapFile)) : null
  },

  saveLocalMeta: (type, meta) => {
    const dir = path.resolve('.losant')
    const mapFile = path.resolve(dir, `${type}.yml`)
    mkdirp(dir)
    fs.writeFileSync(mapFile, yaml.safeDump(meta))
    return mapFile
  },

  checksum: (str) => {
    return crypto.createHash('md5')
    .update(str, 'utf8')
    .digest('hex')
  },

  getLocalStatus: (dir, pattern, type) => {
    const status = []
    const meta = utils.loadLocalMeta(type) || {}
    const metaFiles = new Set(Object.keys(meta))
    const files = glob.sync(path.resolve(dir) + pattern)
    files.forEach((file) => {
      const relFile = path.relative('.', file)
      metaFiles.delete(relFile)
      const id = meta[relFile] ? meta[relFile].id : undefined
      const stats = fs.statSync(file)
      const parts = relFile.split(path.sep)
      const stat = {
        id: id,
        file: relFile,
        type: parts[1].slice(0, -1),
        name: path.basename(relFile, path.extname(pattern)),
        origModTime: meta[relFile] ? meta[relFile].time : undefined,
        localModTime: stats.mtime.getTime() / 1000,
        origMd5: meta[relFile] ? meta[relFile].md5 : undefined,
        localMd5: utils.checksum(fs.readFileSync(file))
      }
      if (!stat.id) {
        stat.status = 'added'
      } else if (stat.localModTime !== stat.origModTime && stat.localMd5 !== stat.origMd5) {
        stat.status = 'modified'
      } else {
        stat.status = 'unmodified'
      }
      status.push(stat)
    })
    metaFiles.forEach((file) => {
      if (minimatch(file, dir + pattern)) {
        status.push({
          id: meta[file].id,
          file: file,
          name: path.basename(file, path.extname(pattern)),
          origModTime: meta[file].time,
          localModTime: undefined,
          origMd5: meta[file].md5,
          localMd5: undefined,
          status: 'deleted'
        })
      }
    })
    return status.sort((a, b) => {
      if (a.file < b.file) { return -1 }
      if (a.file > b.file) { return 1 }
      return 0
    })
  },

  getRemoteStatus: (ext, type, resources, categoryProperty, contentProperty) => {
    const status = []
    const meta = utils.loadLocalMeta(type) || {}
    const metaById = {}
    const metaIds = new Set()
    Object.keys(meta).forEach((file) => {
      const item = meta[file]
      metaById[item.id] = Object.assign({}, item, { file: file })
      metaIds.add(item.id)
    })
    resources.forEach((resource) => {
      metaIds.delete(resource.id)
      const file = path.join(type, categoryProperty ? `${resource[categoryProperty]}s` : '', `${sanitize(resource.name)}${ext}`)
      const mtime = new Date(resource.lastUpdated)
      const stat = {
        id: resource.id,
        file: file,
        type: resource.viewType,
        name: resource.name,
        origModTime: metaById[resource.id] ? metaById[resource.id].time : undefined,
        remoteModTime: Math.trunc(mtime.getTime() / 1000),
        origMd5: metaById[resource.id] ? metaById[resource.id].md5 : undefined,
        remoteMd5: utils.checksum(resource[contentProperty])
      }
      if (!metaById[resource.id]) {
        stat.status = 'added'
      } else if (stat.remoteModTime !== stat.origModTime && stat.remoteMd5 !== stat.origMd5) {
        stat.status = 'modified'
      } else {
        stat.status = 'unmodified'
      }
      status.push(stat)
    })
    metaIds.forEach((id) => {
      status.push({
        id: id,
        file: metaById[id].file,
        name: path.basename(metaById[id].file, ext),
        origModTime: metaById[id].file.time,
        localModTime: undefined,
        origMd5: metaById[id].file.md5,
        localMd5: undefined,
        status: 'deleted'
      })
    })
    return status.sort((a, b) => {
      if (a.file < b.file) { return -1 }
      if (a.file > b.file) { return 1 }
      return 0
    })
  }

}

module.exports = utils