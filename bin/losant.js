#!/usr/bin/env node
const ON_DEATH = require('death'); //this is intentionally ugly
const { logError, log } = require('../lib/utils');

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

ON_DEATH(function(signal, err) {
  log(`Unexpected shut down with signal ${signal}`);
  logError(err);
  // this is for the lcoker if the process ends with a singal of 1, it will automagically unlock everything
  // this will get fired on SIGINT, SIGQUIT, SIGETERM
  process.exit(1);
});
