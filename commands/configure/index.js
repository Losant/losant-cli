const program = require('commander');
const c = require('chalk');
const { saveConfig, logError, logResult, setDir } = require('../../lib/utils');
const { options } = require('../../lib/constants');

program
  .description('Configure the command line tool')
  .option(...options.directory)
  .option(...options.config)
  .option('-a, --app <id>', 'set the application id')
  .option('-t, --token <token>', 'set the api token')
  .action(async (command) => {
    if (!command.app) {
      logError('application id is required');
      process.exit(1);
    }
    if (!command.token) {
      logError('api token is required');
      process.exit(1);
    }

    setDir(command);
    const config = { applicationId: command.app, apiToken: command.token };
    try {
      const file = await saveConfig(command.config, config);
      logResult('success', `configuration written to ${c.bold(file)}`, 'green');
    } catch (e) {
      logError(`failed to write configuration: ${c.bold(e.message)}`);
    }
  });

module.exports = program;
