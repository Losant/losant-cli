const chokidar = require('chokidar');
const { isEmpty, forEachSerialP, includes  } = require('omnibelt');
const { logError, logResult, loadConfig, unlockConfig } = require('./utils');
const paramsByCommand = require('./get-upload-params');
const getUploader = require('./get-uploader');
const path = require('path');

module.exports = (nameOfDirectory, interval = 5000) => {
  const uploader = getUploader(paramsByCommand[nameOfDirectory], { usePolling: process.platform === 'win32' });
  const queue = [];
  const queueData = new Map();
  let isRunning = false;

  return async (command) => {
    const config = await loadConfig();
    if (isEmpty(config)) {
      return;
    }
    const timerId = setInterval(async () => {
      if (queue.length && !isRunning) {
        const queueLength = new Array(queue.length);
        logResult('upload', 'processing queue', 'magentaBright');
        isRunning = true;
        await forEachSerialP(async () => {
          const file = queue.shift();
          const qPattern = queueData.get(file);

          await uploader(qPattern, command, config);
          queueData.delete(file);
        }, queueLength);
        isRunning = false;
      }
    }, interval);

    const watcher = chokidar.watch(nameOfDirectory);
    watcher.on('error', async (err) => {
      clearInterval(timerId);
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
      const typeFile = file.replace(nameOfDirectory, '');
      if (nameOfDirectory === 'experience') {
        const parsed = path.parse(typeFile);
        pattern = parsed.base;
        command.type = parsed.dir.replace(path.sep, '');
      } else {
        pattern = typeFile;
      }

      if (includes(file, queue)) {
        queue.splice(queue.indexOf(file), 1);
        logResult('change', `occurred on ${file}, re-queueing upload`, 'magentaBright');
      } else {
        logResult('change', `occurred on ${file}, queueing upload`, 'magentaBright');
      }
      queue.push(file);
      queueData.set(file, pattern);
    });
  };
};
