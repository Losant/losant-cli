const program = require('commander');
const c = require('chalk');
const { saveConfig, logError, logResult, setDir } = require('../../lib/utils');

module.exports = (() => {
  program
    .description('Configure the command line tool')
    .option('-a, --app <id>', 'set the application id')
    .option('-t, --token <token>', 'set the api token')
    .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")', 'losant.yml')
    .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
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
        const file = await saveConfig(command.config, config)
        logResult('success', `configuration written to ${c.bold(file)}`, 'green');
      } catch (e) {
        logError(`failed to write configuration: ${c.bold(e.message)}`);
      }
    });

  return program;

})();