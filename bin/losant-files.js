#!/usr/bin/env node
const program = require('commander');
const losant = require('losant-rest');
const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');
const request = require('sync-request');
const FormData = require('form-data');
const mimeTypes = require('mime-types');
const { curry } = require('omnibelt');
const {
  utils: {
    loadConfig, loadLocalMeta, saveLocalMeta,
    getLocalStatus, getRemoteStatus, checksum,
    log, logProcessing, logResult, logError
  },
  watchFiles,
  getStatusFunc,
  getDownloader
} = require('../lib');

program
  .description('Manage Losant Files from the command line');

program
  .command('download [pattern]')
  .option('-f, --force', 'force all changes by ignoring modification checking')
  .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
  .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
  .option('--dry-run', 'display actions but do not perform them')
  .action(getDownloader(
    'files',
    'files',
    async (file, item) => {
      const res = await request('GET', file.url);
      if (res.statusCode !== 200) {
        throw new Error(`${item.file} (${res.statusCode}: ${file.url})`);
      }
      return res.getBody();
    },
    curry((pattern, file) => {
      if (file.type === 'directory') { return false; }
      if (!pattern) { return true; }
      return minimatch(file.parentDirectory + file.name, pattern);
    }),
    [ '/**/*.*' ],
    [ 'files${parentDirectory}${name}' ] // eslint-disable-line no-template-curly-in-string
  ));

program
  .command('upload [pattern]')
  .option('-f, --force', 'force all changes by ignoring modification checking')
  .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
  .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
  .option('--dry-run', 'display actions but do not perform them')
  .action(async (pattern, command) => {
    if (command.dir) {
      process.chdir(command.dir);
    }
    const config = loadConfig(command.config);
    const api = losant.createClient({ accessToken: config.apiToken });
    const meta = loadLocalMeta('files') || {};
    try {
      const files = await api.files.get({ applicationId: config.applicationId });
      const items = files.items;
      // grab remote status and map to file
      const remoteStatus = getRemoteStatus('files', items, 'files${parentDirectory}${name}'); // eslint-disable-line no-template-curly-in-string
      const remoteStatusById = {};
      remoteStatus.forEach((item) => {
        if (item.id) {
          remoteStatusById[item.id] = item;
        }
      });
      // iterate over local status and perform the appropriate action
      const localStatus = getLocalStatus('files', `/${pattern || '**/*'}`, 'files');
      if (command.dryRun) {
        log('DRY RUN');
      }
      await Promise.all(localStatus.map((item) => {
        logProcessing(item.file);
        // if forcing the update ignore conflicts and remote modifications
        if (!command.force) {
          if (item.status === 'unmodified') {
            logResult('unmodified', item.file);
            return;
          }
          // TODO implement conflict detection
          // if ((remoteStatusById[item.id] && remoteStatusById[item.id].status !== 'unmodified')) {
          //   logResult('conflict', item.file, 'red')
          //   return Promise.resolve()
          // }
        }
        if (item.status === 'deleted') {
          if (!command.dryRun) {
            return api.files
              .delete({ applicationId: config.applicationId,  fileId: item.id })
              .then(() => {
                delete meta[item.file];
                logResult('deleted', item.file, 'yellow');
                return Promise.resolve();
              });
          }
          logResult('deleted', item.file, 'yellow');
          return Promise.resolve();
        } else {
          if (!command.dryRun) {
            let action;
            const body = fs.readFileSync(item.file);
            if (item.id) {
              action = api.file
                .patch({
                  applicationId: config.applicationId,
                  fileId: item.id,
                  file:  {
                    fileSize: item.size
                  }
                });
            } else {
              const pathParts = item.file.split(path.sep);
              action = api.files
                .post({
                  applicationId: config.applicationId,
                  file: {
                    name: item.name,
                    parentDirectory: pathParts.slice(1, -1).join(path.sep),
                    type: 'file',
                    fileSize: item.size,
                    contentType: mimeTypes.lookup(item.file)
                  }
                });
            }
            return action.then((file) => {
              return new Promise((resolve, reject) => {
                const fd = new FormData();
                Object.keys(file.upload.fields).forEach((key) => {
                  if (key !== 'bucket') {
                    fd.append(key, file.upload.fields[key]);
                  }
                });
                fd.append('file', body);
                fd.submit(file.upload.url, (err, res) => {
                  // const body = [];
                  if (err) {
                    return reject(err);
                  }
                  res.on('data', (chunk) => {
                    body.push(chunk);
                  });
                  res.on('end', () => {
                    return resolve(file);
                  });
                });
              });
            }).then((file) => {
              const mtime = new Date(file.lastUpdated);
              //fs.writeFileSync(item.file, body)
              meta[item.file] = {
                id: file.id,
                md5: checksum(body),
                remoteTime: mtime.getTime(),
                localTime: item.localModTime * 1000
              };
              logResult('uploaded', item.file, 'green');
              return Promise.resolve();
            });
          }
          logResult('uploaded', item.file, 'green');
          return Promise.resolve();
        }
      }));
      saveLocalMeta('files', meta);
    } catch (error) {
      saveLocalMeta('files', meta);
      logError(error);
    }
  });

program
  .command('status')
  .option('-c, --config <file>', 'config file to run the command with')
  .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
  .option('-r, --remote', 'show remote file status')
  .action()
  .action(getStatusFunc(
    'files',
    'files',
    [ 'files${parentDirectory}${name}' ], // eslint-disable-line no-template-curly-in-string
    [ '/**/*.*' ],
    (item) => { return item.type === 'file'; })
  );

program
  .command('watch')
  .option('-c, --config <file>', 'config file to run the command with')
  .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
  .action(watchFiles);

program.on('--help', () => {
  log('');
  log('  Examples:');
  log('');
  log('    Download all files');
  log('     $ losant files download \n');
  log('    Download files in images directory');
  log('     $ losant files download images/* \n');
  log('    Force a download of all files overwriting local modifications');
  log('     $ losant files download -f \n');
  log('    Check local modification status');
  log('     $ losant files status \n');
  log('    Check remote modification status');
  log('     $ losant files status -r \n');
  log('    Upload all files');
  log('     $ losant files upload \n');
  log('    Upload files in images directory');
  log('     $ losant files upload images/* \n');
  log('    Force an upload of all files overwriting remote modifications');
  log('     $ losant files upload -f \n');
  log('');
});

program.parse(process.argv);
