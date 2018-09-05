const fs               = require('fs');
const mkdirp           = require('mkdirp');
const { promisify }    = require('util');
const writeFile        = promisify(fs.writeFile);
const fileStats        = promisify(fs.stat);
const deleteFile       = promisify(fs.unlink);
const buildDirectories = promisify(mkdirp);

module.exports = {
  fileStats,
  deleteFile,
  writeFile,
  buildDirectories
};
