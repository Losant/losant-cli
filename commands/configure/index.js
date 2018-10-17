const program = require('commander');
const losant = require('losant-rest');
const c = require('chalk');
const { saveConfig, logError, logResult, setDir } = require('../../lib/utils');
const { options } = require('../../lib/constants');
const inquirer = require('inquirer');
const { trim } = require('omnibelt');

program
  .description('Configure the command line tool')
  .option(...options.directory)
  .action(async (command) => {
    const { email, password, filter } = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter Losant email' },
      { type: 'password', name: 'password', message: 'Enter Losant password' },
      { type: 'input', name: 'filter', message: 'Enter an Application Name' }
    ]);
    let token;
    const api = losant.createClient();
    try {
      const results = await api.auth.authenticateUser({ credentials: { email: trim(email), password }, tokenTTL: 0 });
      token = results.token;
    } catch (e) {
      return logError(`Failed to authenticate with Losant: ${e.message}`);
    }
    api.setOption('accessToken', token);

    const applications = await api.applications.get({ filterField: 'name', filter });
    let applicationId, applicationName;
    if (!applications.count) {
      logError(`Failed to find any applications with the name ${filter}`);
    } else if (applications.count === 1) {
      applicationId = applications.items[0].id;
    } else {
      const nameToId = {};
      applications.items.forEach(({ id, name }) => { nameToId[name] = id; });
      const { name } = await inquirer.prompt([ { type: 'list', name: 'name', message: `Several applications were found with the name ${filter}, choose one:`, choices: Object.keys(nameToId) } ]);
      applicationId = nameToId[name];
      applicationName = name;
    }

    setDir(command);
    const config = { applicationId, apiToken: token };
    try {
      const file = await saveConfig(command.config, config);
      logResult('success', `configuration written to ${c.bold(file)} for the application ${applicationName}`, 'green');
    } catch (e) {
      logError(`failed to write configuration: ${c.bold(e.message)}`);
    }
  });

module.exports = program;
