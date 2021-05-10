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
const { curry } = require('omnibelt');

const getEmail = async () => {
  const { email } = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'Enter Losant email:' }
  ]);
  return email;
};

const signIn = curry(async ({ originalEmail } = {}, isRetry) => {
  let email;
  if (isRetry) {
    logError('Authentication failed please try again...');
    email = await getEmail();
  } else {
    email = originalEmail;
  }
  const { password, twoFactorCode } = await inquirer.prompt([
    { type: 'password', name: 'password', message: 'Enter Losant password:' },
    { type: 'input', name: 'twoFactorCode', message: 'Enter two factor auth code (if applicable):' }
  ]);
  if (!email || !password) {
    throw error({ type: 'Required' });
  }
  return getApi({ email, password, twoFactorCode });
});

const isLockedError = (err) => {
  return err.type === 'AccountLocked';
};

program
  .description('Log in and create your user configuration to use the other commands.')
  .action(async () => {
    let api;
    const email = await getEmail();
    api = await getApi();
    const isSSoAccount = await api.auth.ssoDomain({ email });

    if (isSSoAccount) {
      const { token: apiToken } = await inquirer.prompt([
        {
          type: 'input',
          name: 'token',
          message: `This account, ${email}, is linked to a Single Sign-On (SSO) provider. Please create a CLI-Scoped User API Token in your Losant account, and then enter it here:`
        }
      ]);
      api = await getApi({ apiToken });
    } else {
      const loginFunc = signIn({ originalEmail: email });
      try {
        api = await retryP(loginFunc, isLockedError);
      } catch (e) {
        return logError(e);
      }
    }

    try {
      const wlInfo = await api.request({ method: 'get', url: '/whitelabels/domain' });
      const userFile = await saveUserConfig({
        [api.getOption('url')]: {
          apiToken: api.getOption('accessToken'),
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
