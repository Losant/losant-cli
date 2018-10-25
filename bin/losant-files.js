#!/usr/bin/env node --harmony
require('../lib/on-death');
require('../commands/files')
  // .on('command:*', function () {
  //   console.error('Invalid command: %s\nRun losant files --help for a list of available commands.', program.args.join(' '));
  //   process.exit(1);
  // })
  .parse(process.argv);
