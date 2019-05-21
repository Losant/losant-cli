const path = require('path');
const {
  sinon,

} = require('../common');
const { saveUserConfig } = require('../../lib/utils');
const { defer } = require('omnibelt');
const inquirer = require('inquirer');


describe('Configure Commands', () => {
  it('should prompt the user if there are multiple config urls', async () => {
    const conf1 = {};
    const conf2 = {};
    conf1['https://api.losant.space'] = { apiToken: 'token' };
    conf2['https://api.losant.com'] = { apiToken: 'token' };
    await saveUserConfig(conf1);
    await saveUserConfig(conf2);

    const deferred = defer();
    let urls = [];

    sinon.stub(inquirer, 'prompt').callsFake((data) => {
      urls = data[0].choices;
      deferred.resolve();

    });
    require('../../commands/configure').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-configure.js')]);

    await deferred.promise;
    urls.should.deepEqual(['https://api.losant.space', 'https://api.losant.com']);
  });
});
