#!/usr/bin/env node
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const program = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const pgm = program
  .version(pkg.version)
  .description('Losant CLI is a command line tool to help manage your Losant Application and its resources.')
  .command('login', 'Log in and create your user configuration to use the other commands.')
  .command('set-token', 'Create a User API Token in your Losant account, then set it here to configure the command line tool.')
  .command('configure', 'Configure the command line tool for a specific directory.')
  .command('experience', 'Manages your Losant Application\'s Experience Views, and Versions from the command line.')
  .command('files', 'Manage Files on Losant for your Application.')
  .command('datatables', 'Manage Data Tables on Losant for your Application.');

const results = pgm.parse(process.argv);

if (results) {
  console.error('Unknown command: %s\n', results.args.join(' '));
  pgm.help();
}

updateNotifier({ pkg }).notify();
