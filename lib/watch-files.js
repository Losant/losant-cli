const chokidar = require('chokidar');
const { isEmpty, forEachSerialP, defer } = require('omnibelt');
const { logError, logResult, loadConfig, unlockConfig } = require('./utils');
const paramsByCommand = require('./get-upload-params');
const getUploader = require('./get-uploader');
const path = require('path');

module.exports = (nameOfDirectory, interval = 5000) => {
  const uploader = getUploader(paramsByCommand[nameOfDirectory], { usePolling: process.platform === 'win32' });
  const queueSet = new Set();
  let isRunning = false;
  return async () => {
    const deferred = defer();
    const config = await loadConfig();
    if (isEmpty(config)) {
      return;
    }
    let timerId = setInterval(async () => {
      if (isRunning) { return; }
      isRunning = true;
      const queue = Array.from(queueSet);
      queueSet.clear();
      if (queue.length) {
        logResult('upload', 'processing queue', 'magentaBright');
        await forEachSerialP(async (file) => {
          let pattern, type;
          const typeFile = file.replace(nameOfDirectory, '');
          if (nameOfDirectory === 'experience') {
            const parsed = path.parse(typeFile);
            pattern = parsed.base;
            type = parsed.dir.replace(path.sep, '');
          } else {
            pattern = typeFile;
          }
          await uploader(pattern, { type }, {}, config);
        }, queue);
      }
      isRunning = false;
    }, interval);
    const watcher = chokidar.watch(nameOfDirectory);
    watcher.on('error', async (err) => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      logError(err);
      watcher.unwatch(nameOfDirectory);
      await unlockConfig();
      process.exit(1);
    });
    watcher.on('ready', () => {
      deferred.resolve();
      logResult('Started watching ::', `${nameOfDirectory}`, 'cyanBright');
    });
    watcher.on('change', async (file) => {
      logResult('change', `occurred on ${file}, queueing upload`, 'magentaBright');
      queueSet.add(file);
    });
    const close = function() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      if (watcher) {
        watcher.close();
        watcher.removeAllListeners();
      }

    };
    await deferred.promise;
    return close;
  };
};
