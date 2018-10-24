const losant = require('losant-rest');
const { trim } = require('omnibelt');

process.env.LOSANT_API_URL = process.env.LOSANT_API_URL || 'https://api.losant.com';

module.exports = async ({ email, password, twoFactorCode, apiToken }) => {
  const api = losant.createClient({ url: process.env.LOSANT_API_URL });
  if (email && password) {
    // not try catching this, should only be used on configure and the errors will be hanlded there.
    const results = await api.auth.authenticateUser({ credentials: { email: trim(email), password, twoFactorCode }, tokenTTL: 0 });
    apiToken = results.token;
  }
  api.setOption('accessToken', apiToken);
  return api;
};
