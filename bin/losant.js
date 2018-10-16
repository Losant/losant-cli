#!/usr/bin/env node --harmony

const program = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .description('Losant CLI is a command line tool to aid developers while creating custom application on top of the Losant Platform')
  .command('configure', 'Configure the command line tool for a specific directory')
  .command('experience', 'Manage Experiences on Losant for your Application')
  .command('files', 'Manage Files on Losant for your Application')
  .parse(process.argv);

updateNotifier({ pkg }).notify();
