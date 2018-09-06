#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');
const { curry } = require('omnibelt');
const {
  utils: { checksum, log },
  watchFiles,
  getStatusFunc,
  getDownloader,
  getUploader
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
  .action(getUploader(
    'experienceViews',
    'views',
    [ '/**/*.hbs' ],
    [ 'views/${viewType}s/${name}.hbs', 'body' ], // eslint-disable-line no-template-curly-in-string
    (item, remoteStatus) => {
      return remoteStatus && remoteStatus.status !== 'unmodified';
    },
    (item, config) => {
      return { applicationId: config.applicationId,  experienceViewId: item.id };
    },
    (item, config) => {
      // TODO remove sync part and make promisified
      const body = fs.readFileSync(item.file);
      return {
        applicationId: config.applicationId,
        experienceViewId: item.id,
        experienceView:  { body: body.toString() }
      };
    },
    (item, config) => {
      // TODO remove sync part and make promisified
      const body = fs.readFileSync(item.file);
      const pathParts = item.file.split(path.sep);
      return {
        applicationId: config.applicationId,
        experienceView: {
          viewType: pathParts[1].slice(0, -1),
          name: item.name,
          body: body.toString()
        }
      };
    },
    async (view, meta, item) => {
      const mtime = new Date(view.lastUpdated);
      // mkdirp.sync(path.dirname(item.file))
      // fs.writeFileSync(item.file, view.body)
      meta[item.file] = {
        id: view.id,
        md5: checksum(view.body),
        remoteTime: mtime.getTime(),
        localTime: item.localModTime * 1000
      };
    }
  ));

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
