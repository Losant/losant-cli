const error = require('error/typed');
const p = require('commander');
const program = new p.Command('losant login');
const getApi = require('../../lib/get-api');
const retryP = require('../../lib/retryP');
const c = require('chalk');
const {
  saveUserConfig, logError, logResult
} = require('../../lib/utils');
const inquirer = require('inquirer');

const signIn = async (isRetry) => {
  if (isRetry) {
    logError('Authentication failed please try again...');
  }
  const { email } = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'Enter Losant email:' }
  ]);
  let api = await getApi();
  const apiCreds = {};
  const isSSoAccount = await api.auth.ssoDomain({ email });
  if (isSSoAccount) {
    const { token: apiToken } = await inquirer.prompt([
      {
        type: 'input',
        name: 'token',
        message: `This account, ${email}, is linked to a Single Sign-On (SSO) provider. Please create a CLI-Scoped User API Token in your Losant account, and then enter it here:`
      }
    ]);
    apiCreds.apiToken = apiToken;
  } else {
    const { password, twoFactorCode } = await inquirer.prompt([
      { type: 'password', name: 'password', message: 'Enter Losant password:' },
      { type: 'input', name: 'twoFactorCode', message: 'Enter two-factor auth code (if applicable):' }
    ]);
    if (!email || !password) {
      throw error({ type: 'Required' });
    }
    apiCreds.email = email;
    apiCreds.password = password;
    apiCreds.twoFactorCode = twoFactorCode;
  }
  api = await getApi(apiCreds);
  const wlInfo = await api.request({ method: 'get', url: '/whitelabels/domain' });
  return { api, appUrl: wlInfo.appUrl, endpointDomain: wlInfo.endpointDomain };
};

const isLockedError = (err) => {
  return err.type === 'AccountLocked';
};

program
  .description('Log in and create your user configuration to use the other commands.')
  .action(async () => {
    let result;
    try {
      result = await retryP(signIn, isLockedError);
    } catch (e) {
      return logError(e);
    }

    try {
      const userFile = await saveUserConfig({
        [result.api.getOption('url')]: {
          apiToken: result.api.getOption('accessToken'),
          appUrl: result.appUrl,
          endpointDomain: result.endpointDomain
        }
      });
      logResult('success', `configuration written to ${c.bold(userFile)} with your user token!`, 'green');
    } catch (e) {
      logError(`failed to write configuration: ${c.bold(e.message)}`);
    }
  });

module.exports = program;
