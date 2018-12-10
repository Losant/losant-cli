const {
  loadConfig,
  logResult,
  logError
} = require('./utils');
const getApi = require('./get-api');
const { experience } = require('./get-download-params');
const getDownloader = require('./get-downloader');
const downloader = getDownloader(experience);

module.exports = async (cmd, loadedConfig) => {
  const { apiToken, applicationId } = loadedConfig ? loadedConfig : await loadConfig();
  const api = await getApi({ apiToken });
  try {
    const results = await api.experience.bootstrap({ applicationId });
    logResult('Bootstrap Username', `${results.email}`);
    logResult('Bootstrap Password', `${results.password}`);
    await downloader(null, {}, { apiToken, applicationId });
    logResult('Completed', 'Bootstrapping has been successful.', 'green');
  } catch (err) {
    logError(`There was an error bootstrapping: ${err.message}`);
  }
};
