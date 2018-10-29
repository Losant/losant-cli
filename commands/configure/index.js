const error = require('error/typed');
const p = require('commander');
const program = new p.Command('losant configure');
const getApi = require('../../lib/get-api');
const c = require('chalk');
const retryP = require('../../lib/retryP');
const {
  saveConfig, logError, logResult, log, loadUserConfig
} = require('../../lib/utils');
const inquirer = require('inquirer');

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
      const choices = applications.items.map(({ id, name }) => {
        const key = `${name} https://app.losant.com/applications/${id}`;
        nameToId[key] = id;
        return key;
      });
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
  .description('Configure the command line tool for a specific directory.')
  .action(async (command) => {
    const userConfig = await loadUserConfig() || {};
    if (!userConfig.apiToken) {
      return logError('Must run losant sign-in before running losant configure.');
    }
    const api = await getApi({ apiToken: userConfig.apiToken });
    const getApplication = getApplicationFunc(api);
    const { applicationId, applicationName } = await retryP(getApplication, printRetry);

    const config = { applicationId, applicationName };
    try {
      const file = await saveConfig(command.config, config);
      logResult('success', `configuration written to ${c.bold(file)} for the application ${applicationName}`, 'green');
    } catch (e) {
      logError(`failed to write configuration: ${c.bold(e.message)}`);
    }
  });

module.exports = program;
