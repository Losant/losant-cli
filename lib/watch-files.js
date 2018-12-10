const chokidar = require('chokidar');
const { isEmpty } = require('omnibelt');
const { logError, logResult, loadConfig, unlockConfig } = require('./utils');
const paramsByCommand = require('./get-upload-params');
const getUploader = require('./get-uploader');
const path = require('path');

module.exports = (nameOfDirectory) => {
  const uploader = getUploader(paramsByCommand[nameOfDirectory], { usePolling: process.platform === 'win32' });
  return async (command) => {
    const config = await loadConfig();
    if (isEmpty(config)) {
      return;
    }
    const watcher = chokidar.watch(nameOfDirectory);
    watcher.on('error', async (err) => {
      logError(err);
      watcher.unwatch(nameOfDirectory);
      await unlockConfig();
      process.exit(1);
    });
    watcher.on('ready', () => {
      logResult('Started watching ::', `${nameOfDirectory}`, 'cyanBright');
    });
    watcher.on('change', async (file) => {
      let pattern;
      if (nameOfDirectory === 'experience') {
        const typeFile = file.replace(nameOfDirectory, '');
        const parsed = path.parse(typeFile);
        pattern = parsed.base;
        command.type = parsed.dir.replace(path.sep, '');
      } else {
        pattern = file.replace(`${nameOfDirectory}${path.sep}`, `*${path.sep}`);
      }
      logResult('change', `occurred on ${file}, kicking off upload`, 'magentaBright');
      await uploader(pattern, command, config);
    });
  };
};
