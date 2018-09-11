const fs               = require('fs');
const mkdirp           = require('mkdirp');
const { promisify }    = require('util');
const writeFile        = promisify(fs.writeFile);
const fileStats        = promisify(fs.stat);
const deleteFile       = promisify(fs.unlink);
const readFile         = promisify(fs.readFile);
const buildDirectories = promisify(mkdirp);
const fileExists = async (path) => {
  try {
    await fileStats(path);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
  return true;
};

module.exports = {
  fileStats,
  fileExists,
  deleteFile,
  writeFile,
  buildDirectories,
  readFile
};
