const path = require('path');
const ssLog = require('single-line-log');
const {
  sinon,
  errorLog,
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
});
