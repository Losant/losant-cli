const chokidar = require('chokidar');
const { isEmpty, forEachSerialP } = require('omnibelt');
const { logError, logResult, loadConfig, unlockConfig } = require('./utils');
const paramsByCommand = require('./get-upload-params');
const getUploader = require('./get-uploader');
const path = require('path');

const queueInfo = {
  queue: [],
  queueData: new Map(),
  isRunning: false
};

setInterval(async () => {
  const { queue, queueData } = queueInfo;
  let { isRunning } = queueData;
  logResult('upload', 'processing queue', 'magentaBright');
  if (queue.length && !isRunning) {
    isRunning = true;
    await forEachSerialP(async () => {
      const file = queue.pop();
      const { pattern, command, config, uploader } = queueData.get(file);

      await uploader(pattern, command, config);
      queueData.delete(file);
    }, queue);
    isRunning = false;
  }
}, 5000);

module.exports = (nameOfDirectory) => {
  const { queue, queueData } = queueInfo;
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
      }
      logResult('change', `occurred on ${file}, queueing upload`, 'magentaBright');

      if (queueData.has(file)) { queue.splice(queue.indexOf(file)); }
      queue.push(file);
      queueData.set(file, { pattern, command, config, uploader });
    });
  };
};
