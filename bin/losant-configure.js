#!/usr/bin/env node

const program = require('commander');
const c = require('chalk');
const { saveConfig } = require('../lib/utils');
const { logError, logResult, setDir } = require('../lib/utils');

program
  .description('Configure the command line tool')
  .option('-a, --app <id>', 'set the application id')
  .option('-t, --token <token>', 'set the api token')
  .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")', 'losant.yml')
  .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
  .parse(process.argv);

if (!program.app) {
  logError('application id is required');
  process.exit(1);
}
if (!program.token) {
  logError('api token is required');
  process.exit(1);
}

try {
  setDir(program);
  const config = { applicationId: program.app, apiToken: program.token };
  const file = saveConfig(program.config, config);
  logResult('success', `configuration written to ${c.bold(file)}`, 'green');
} catch (e) {
  logError(`failed to write configuration: ${c.bold(e.message)}`);
}
