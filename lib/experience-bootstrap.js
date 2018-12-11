const {
  loadConfig,
  logResult,
  logError,
  hasBootstrapped
} = require('./utils');
const getApi = require('./get-api');
const { experience } = require('./get-download-params');
const getDownloader = require('./get-downloader');
const downloader = getDownloader(experience);

module.exports = async (cmd, loadedConfig, applicationInfo) => {
  const { apiToken, applicationId, applicationName } = loadedConfig ? loadedConfig : await loadConfig();
  const api = await getApi({ apiToken });
  try {
    applicationInfo = applicationInfo || await api.application.get({ applicationId });
    const bootstrap = hasBootstrapped(applicationInfo);
    if (bootstrap) {
      return logResult('Cannot Complete', `Bootstrapping has already been ${bootstrap.status} for ${applicationName}`, 'yellow');
    }
    const results = await api.experience.bootstrap({ applicationId });
    await downloader(null, {}, { apiToken, applicationId });
    logResult('Experience URL', `https://${applicationInfo.endpointSlug}.onlosant.com/${results.resourceSuffix}`);
    logResult('Bootstrap Username', `${results.email}`);
    logResult('Bootstrap Password', `${results.password}`);
    return logResult('Completed', 'Bootstrapping has been successful.', 'green');
  } catch (err) {
    logError(`There was an error bootstrapping: ${err.message}`);
  }
};
