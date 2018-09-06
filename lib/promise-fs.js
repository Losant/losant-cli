const fs               = require('fs');
const mkdirp           = require('mkdirp');
const { promisify }    = require('util');
const writeFile        = promisify(fs.writeFile);
const fileStats        = promisify(fs.stat);
const deleteFile       = promisify(fs.unlink);
const readFile         = promisify(fs.readFile);
const buildDirectories = promisify(mkdirp);

module.exports = {
  fileStats,
  deleteFile,
  writeFile,
  buildDirectories,
  readFile
};
