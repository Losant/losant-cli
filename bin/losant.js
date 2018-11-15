#!/usr/bin/env node

// set rollbar key
process.env.ROLLBAR_KEY = process.env.ROLLBAR_KEY || 'f16d3d7e486e4b2386fc5fb18264f9b6';

const program = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const pgm = program
  .version(pkg.version)
  .description('Losant CLI is a command line tool to help manage your Losant Application and its resources.')
  .command('login', 'Log in and create your user configuration to use the other commands.')
  .command('configure', 'Configure the command line tool for a specific directory.')
  .command('experience', 'Manages your Losant Application\'s Experience Views, and Versions from the command line.')
  .command('files', 'Manage Files on Losant for your Application.');

const results = pgm.parse(process.argv);

if (results) {
  console.error('Unknown command: %s\n', results.args.join(' '));
  pgm.help();
}

updateNotifier({ pkg }).notify();
