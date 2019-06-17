const path = require('path');
const ssLog = require('single-line-log');
const {
  sinon,
  nock,
  errorLog,
  buildConfig,
  buildUserConfig
} = require('../common');
const { defer } = require('omnibelt');

describe('Data Tables Commands', () => {
  it('should log an error if configure was not run first', async function() {
    await buildUserConfig();
    const deferred = defer();
    sinon.stub(ssLog, 'stdout').callsFake((message) => {
      deferred.resolve(message);
    });

    require('../../commands/dataTables').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-dataTables.js'),
      'status'
    ]);
    const msg = await deferred.promise;
    msg.should.equal(errorLog('Configuration file missing for this directory, run losant configure to generate this file.'));
  });

  it('should run get status', async function() {
    await buildConfig();
    const deferred = defer();
    nock('https://api.losant.space:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/data-tables')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
      .reply(200, {});
    sinon.stub(ssLog, 'stdout').callsFake((message) => {
      deferred.resolve(message);
    });

    require('../../commands/dataTables').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-dataTables.js'),
      'status'
    ]);
    const msg = await deferred.promise;
    msg.should.equal('No dataTables found.');
  });
});
