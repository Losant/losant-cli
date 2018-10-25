#!/usr/bin/env node
const program = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .description('Losant CLI is a command line tool to aid developers while creating custom applications on top of the Losant Platform.')
  .command('configure', 'Configure the command line tool for a specific directory')
  .command('experience', 'Manage Experiences on Losant for your Application')
  .command('files', 'Manage Files on Losant for your Application')
  // .on('command:*', function () {
  //   console.log(program.args);
  //   console.error('Invalid command: %s\nRun losant --help for a list of available commands.', program.args.join(' '));
  //   process.exit(1);
  // })
  .parse(process.argv);

updateNotifier({ pkg }).notify();
