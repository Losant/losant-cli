const {
  loadConfig,
  logResult,
  logError,
  hasBootstrapped
} = require('./utils');
const { experience } = require('./get-download-params');
const getDownloader = require('./get-downloader');
const downloader = getDownloader(experience);
const inquirer = require('inquirer');

module.exports = async (options, cmd, loadedConfig, applicationInfo) => {
  const { apiToken, applicationId, applicationName, api, endpointDomain } = loadedConfig || await loadConfig();
  try {
    applicationInfo = applicationInfo || await api.application.get({ applicationId });
    const bootstrap = hasBootstrapped(applicationInfo);
    if (bootstrap) {
      if (bootstrap.status === 'completed') {
        return logResult('Cannot Complete', `Bootstrapping has already been ${bootstrap.status} for ${applicationName}`, 'yellow');
      } else {
        const { shouldBootstrap } = await inquirer.prompt([{
          type: 'confirm',
          name: 'shouldBootstrap',
          message: `You have already skipped bootstrapping for ${applicationName}, are you sure you want to bootstrap now?`
        }]);
        if (!shouldBootstrap) {
          return logResult('Skip', `Bootstrapping for this application ${applicationName}.`, 'yellow');
        }
      }
    }
    const results = await api.experience.bootstrap({ applicationId });
    await downloader(null, {}, {}, { apiToken, applicationId, api });
    logResult('Experience URL', `https://${applicationInfo.endpointSlug}.${endpointDomain}/${results.resourceSuffix}`);
    logResult('Bootstrap Username', `${results.email}`);
    logResult('Bootstrap Password', `${results.password}`);
    return logResult('Completed', 'Bootstrapping has been successful.', 'green');
  } catch (err) {
    logError(`There was an error bootstrapping: ${err.message}`);
  }
};
