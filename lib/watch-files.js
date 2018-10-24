const chokidar = require('chokidar');
const { logError, setDir, logResult, loadConfig } = require('./utils');
const paramsByCommand = require('./get-upload-params');
const getUploader = require('./get-uploader');

module.exports = (nameOfDirectory) => {
  const uploader = getUploader(paramsByCommand[nameOfDirectory]);
  return async (command) => {
    setDir(command);
    const config = await loadConfig(command.config);
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
      const f = file.replace(`${nameOfDirectory}/`, '*/');
      logResult('CHANGED ::', `occurred on ${file}, kicking off upload`, 'magentaBright');
      await uploader(f, command, config);
      logResult('COMPLETED :: ', `${file}`, 'magentaBright');
    });
  };
};
