const lockfile = require('proper-lockfile');
const fs = require('fs-extra');
const path = require('path');
const recursive = require('recursive-readdir');

module.exports = async (directory) => {
  const absoluteDir = path.resolve(process.cwd(), directory);
  let releases = [];
  if ((await fs.pathExists(absoluteDir))) {
    const files = await recursive(path.resolve(process.cwd(), directory));
    const lockPromises = files.map((file) => {
      return lockfile.lock(file);
    });

    releases = await Promise.all(lockPromises);

  }
  const releaseLocks = () => {
    if (releases.length) {
      return Promise.all(releases.map((release) => { return release(); }));
    }
  };

  return releaseLocks;
};
