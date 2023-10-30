const p = require('commander');
const program = new p.Command('losant set-token');
const inquirer = require('inquirer');
const getApi = require('../../lib/get-api');
const c = require('chalk');
const {
  saveUserConfig, logError, logResult
} = require('../../lib/utils');

program
  .description('Create a User API Token in your Losant account, then set it here to configure the command line tool.')
  .argument('[token]', 'The API token to set (if not passed, user will be prompted)')
  .showHelpAfterError()
  .action(async (token) => {
    let apiToken = token;
    if (!apiToken) {
      // prompt the user to input a token
      const res = await inquirer.prompt([
        { type: 'input', name: 'token', message: 'Enter a Losant User API token:' }
      ]);
      apiToken = res.token;
    }
    try {
      const api = await getApi({ apiToken });
      const wlInfo = await api.request({ method: 'get', url: '/whitelabels/domain' });
      const userFile = await saveUserConfig({
        [api.getOption('url')]: {
          apiToken,
          appUrl: wlInfo.appUrl,
          endpointDomain: wlInfo.endpointDomain
        }
      });
      logResult('success', `configuration written to ${c.bold(userFile)} with your user token!`, 'green');
    } catch (e) {
      logError(`failed to write configuration: ${c.bold(e.message)}`);
    }
  });

module.exports = program;
