import { watch as chokidarWatch } from 'chokidar';
import { isEmpty, forEachSerialP, defer } from 'omnibelt';
import utils from './utils.js';
import paramsByCommand from './get-upload-params.js';
import getUploader from './get-uploader.js';
import path from 'path';

const { logError, logResult, loadConfig, unlockConfig } = utils;

export default (nameOfDirectory, interval = 5000) => {
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
    const watcher = chokidarWatch(nameOfDirectory);
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
