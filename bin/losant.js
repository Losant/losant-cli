#!/usr/bin/env node

const program = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .description('Losant CLI is a command line tool to aid developers while creating custom application on top of the Losant Platform')
  .command('configure', 'Configure the command line tool')
  .command('views', 'Manage Experience Views')
  .command('files', 'Manage Files')
  .parse(process.argv);

const notifier = updateNotifier({ pkg });
notifier.notify();
