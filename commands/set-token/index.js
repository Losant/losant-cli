import { Command } from 'commander';
import inquirer from 'inquirer';
import getApi from '../../lib/get-api.js';
import c from 'chalk';
import utils from '../../lib/utils.js';

const program = new Command('losant set-token');
const { saveUserConfig, logError, logResult } = utils;

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

export default program;
