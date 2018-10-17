const losant = require('losant-rest');
const { logError } = require('./utils');
const { trim } = require('omnibelt');

process.env.LOSANT_API_URL = process.env.LOSANT_API_URL || 'https://api.losant.com';

module.exports = async ({ email, password, apiToken }) => {
  const api = losant.createClient({ url: process.env.LOSANT_API_URL });
  if (email && password) {
    try {
      const results = await api.auth.authenticateUser({ credentials: { email: trim(email), password }, tokenTTL: 0 });
      apiToken = results.token;
    } catch (e) {
      return logError(`Failed to authenticate with Losant: ${e.message}`);
    }
  }
  api.setOption('accessToken', apiToken);
  return api;
};
