const error = require('error/typed');
const p = require('commander');
const program = new p.Command('losant configure');
const getApi = require('../../lib/get-api');
const c = require('chalk');
const {
  saveConfig, logError, logResult, setDir, lockConfig, log
} = require('../../lib/utils');
const inquirer = require('inquirer');

const retryP = async (funcToRetry, stopRetryFunc, isRetry = false) => {
  let result;
  try {
    result = await funcToRetry(isRetry);
  } catch (e) {
    if (!(await stopRetryFunc(e))) {
      return retryP(funcToRetry, stopRetryFunc, true);
    }
    throw e;
  }
  return result;
};

const signIn = async (isRetry) => {
  if (isRetry) {
    logError('Authentication failed please try again...');
  }
  const { email, password, twoFactorCode } = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'Enter Losant email:' },
    { type: 'password', name: 'password', message: 'Enter Losant password:' },
    { type: 'input', name: 'twoFactorCode', message: 'Enter two factor auth code (if applicable):' }
  ]);
  return getApi({ email, password, twoFactorCode });
};

const isLockedError = (err) => {
  return err.type === 'AccountLocked';
};

const getApplicationFunc = (api) => {
  return async () => {
    const { filter } = await  inquirer.prompt([
      { type: 'input', name: 'filter', message: 'Enter an Application Name:' }
    ]);
    let applicationId, applicationName;
    const applications = await api.applications.get({ filterField: 'name', filter });
    if (applications.count > 25) {
      throw error({ type: 'TooMany', message: 'Too many applications found to list through.' });
    } else if (applications.count === 0) {
      throw error({ type: 'NotFound', message: `No applications found with the filter ${filter}` });
    } else if (applications.count === 1) {
      applicationId = applications.items[0].id;
      applicationName = applications.items[0].name;
    } else {
      const nameToId = {};
      applications.items.forEach(({ id, name }) => { nameToId[`${name} https://app.losant.com/applications/${id}`] = id; });
      const choices = Object.keys(nameToId);
      choices.push('none of these, search again');
      const { name } = await inquirer.prompt([{
        type: 'list',
        name: 'name',
        message: `Several applications were found with the name ${filter}, choose one:`,
        choices
      }]);
      if (name === 'none of these, search again') {
        throw error({ type: 'ForceRetry', message: 'user typed in wrong filter' });
      }
      applicationId = nameToId[name];
      applicationName = name;
    }
    return { applicationId, applicationName };
  };
};

const printRetry = (err) => {
  if (err.type === 'ForceRetry') {
    log('Please try a different application name.');
  } else {
    if (!err.type) { return true; }
    if (err.message) {
      log(err.message);
    }
    log('Please try again');
  }
  return false;
};

program
  .description('Configure the command line tool')
  .action(async (command) => {
    setDir(command);
    if (!(await lockConfig(command.config))) { return; }
    let api;
    try {
      api = await retryP(signIn, isLockedError);
    } catch (e) {
      return;
    }
    const getApplication = getApplicationFunc(api);
    const { applicationId, applicationName } = await retryP(getApplication, printRetry);

    const config = { applicationId, apiToken: api.getOption('accessToken') };
    try {
      const file = await saveConfig(command.config, config);
      logResult('success', `configuration written to ${c.bold(file)} for the application ${applicationName}`, 'green');
    } catch (e) {
      logError(`failed to write configuration: ${c.bold(e.message)}`);
    }
  });

module.exports = program;
