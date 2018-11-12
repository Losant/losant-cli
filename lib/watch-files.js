const chokidar = require('chokidar');
const { isEmpty } = require('omnibelt');
const { logError, logResult, loadConfig } = require('./utils');
const paramsByCommand = require('./get-upload-params');
const getUploader = require('./get-uploader');
const path = require('path');

module.exports = (nameOfDirectory) => {
  const uploader = getUploader(paramsByCommand[nameOfDirectory]);
  return async (command) => {
    const config = await loadConfig();
    if (isEmpty(config)) {
      return;
    }
    const watcher = chokidar.watch(nameOfDirectory);
    watcher.on('error', (err) => {
      logError(err);
      watcher.unwatch(nameOfDirectory);
      process.exit(1);
    });
    watcher.on('ready', () => {
      logResult('Started watching ::', `${nameOfDirectory}`, 'cyanBright');
    });
    watcher.on('change', async (file) => {
      const f = file.replace(`${nameOfDirectory}${path.sep}`, `*${path.sep}`);
      logResult('CHANGED ::', `occurred on ${file}, kicking off upload`, 'magentaBright');
      await uploader(f, command, config);
      logResult('COMPLETED :: ', `${file}`, 'magentaBright');
    });
  };
};
