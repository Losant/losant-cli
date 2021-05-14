const losant = require('losant-rest');
const { trim } = require('omnibelt');

module.exports = async ({ url, email, password, twoFactorCode, apiToken } = {}) => {
  const api = losant.createClient({ url: url || process.env.LOSANT_API_URL || 'https://api.losant.com' });
  if (email) {
    // not try catching this, should only be used on configure and the errors will be handled there.
    const results = await api.auth.authenticateUser({ credentials: { email: trim(email), password, twoFactorCode, requestedScopes: [ 'all.User.cli' ], tokenTTL: 0 } });
    apiToken = results.token;
  }
  api.setOption('accessToken', apiToken);
  return api;
};
