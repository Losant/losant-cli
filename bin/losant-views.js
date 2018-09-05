#!/usr/bin/env node
const program = require('commander');
const losant = require('losant-rest');
const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');
const { curry } = require('omnibelt');
const {
  utils: {
    loadConfig,
    loadLocalMeta,
    saveLocalMeta,
    getLocalStatus,
    getRemoteStatus,
    checksum,
    log,
    logProcessing,
    logResult,
    logError
  },
  watchFiles,
  getStatusFunc,
  getDownloader
} = require('../lib');

program
  .description('Manage Losant Experience Views from the command line');

program
  .command('download [pattern]')
  .option('-f, --force', 'force all changes by ignoring modification checking')
  .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
  .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
  .option('--dry-run', 'display actions but do not perform them')
  .action(getDownloader(
    'experienceViews',
    'views',
    (view) => { return view.body; },
    curry((pattern, view) => {
      return minimatch(view.name, pattern);
    }),
    [ '/**/*.hbs' ],
    [ 'views/${viewType}s/${name}.hbs', 'body' ], // eslint-disable-line no-template-curly-in-string
    (item, itemLocalStatus, newLocalFiles) => {
      return (itemLocalStatus && itemLocalStatus.status !== 'unmodified') || newLocalFiles.has(item.file);
    }
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
    const meta = loadLocalMeta('views') || {};
    try {
      const views = await api.experienceViews.get({ applicationId: config.applicationId });
      const items = views.items;
      // grab remote status and map to file
      const remoteStatus = getRemoteStatus('views', items, 'views/${viewType}s/${name}.hbs', 'body'); // eslint-disable-line no-template-curly-in-string
      const remoteStatusById = {};
      remoteStatus.forEach((item) => {
        if (item.id) {
          remoteStatusById[item.id] = item;
        }
      });
      // iterate over local status and perform the appropriate action
      const localStatus = getLocalStatus('views', `/${pattern || '**/*'}.hbs`, 'views');
      if (command.dryRun) {
        log('DRY RUN');
      }
      await Promise.all(localStatus.map((item) => {
        logProcessing(item.file);
        const pathParts = item.file.split(path.sep);
        // if forcing the update ignore conflicts and remote modifications
        if (!command.force) {
          if (item.status === 'unmodified') {
            logResult('unmodified', item.file);
            return;
          }
          if ((remoteStatusById[item.id] && remoteStatusById[item.id].status !== 'unmodified')) {
            logResult('conflict', item.file, 'red');
            return Promise.resolve();
          }
        }
        if (item.status === 'deleted') {
          if (!command.dryRun) {
            return api.experienceView
              .delete({ applicationId: config.applicationId,  experienceViewId: item.id })
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
              action = api.experienceView
                .patch({
                  applicationId: config.applicationId,
                  experienceViewId: item.id,
                  experienceView:  { body: body.toString() }
                });
            } else {
              action = api.experienceViews
                .post({
                  applicationId: config.applicationId,
                  experienceView: {
                    viewType: pathParts[1].slice(0, -1),
                    name: item.name,
                    body: body.toString()
                  }
                });
            }
            return action.then((view) => {
              const mtime = new Date(view.lastUpdated);
              // mkdirp.sync(path.dirname(item.file))
              // fs.writeFileSync(item.file, view.body)
              meta[item.file] = {
                id: view.id,
                md5: checksum(view.body),
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
      saveLocalMeta('views', meta);
    } catch (error) {
      saveLocalMeta('views', meta);
      logError(error);
    }
  });

program
  .command('status')
  .option('-c, --config <file>', 'config file to run the command with')
  .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
  .option('-r, --remote', 'show remote file status')
  .action(getStatusFunc(
    'experienceViews',
    'views',
    [ 'views/${viewType}s/${name}.hbs', 'body' ], // eslint-disable-line no-template-curly-in-string
    [ '/**/*.hbs' ])
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
  log('    Download all views');
  log('     $ losant views download \n');
  log('    Download component views');
  log('     $ losant views download components/* \n');
  log('    Force a download of all views overwriting local modifications');
  log('     $ losant views download -f \n');
  log('    Check local modification status');
  log('     $ losant views status \n');
  log('    Check remote modification status');
  log('     $ losant views status -r \n');
  log('    Upload all view');
  log('     $ losant views upload \n');
  log('    Upload component view');
  log('     $ losant views upload components/* \n');
  log('    Force an upload of all views overwriting remote modifications');
  log('     $ losant views upload -f \n');
  log('');
});

program.parse(process.argv);
