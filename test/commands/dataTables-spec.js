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
      'export'
    ]);
    const msg = await deferred.promise;
    msg.should.equal(errorLog('Configuration file missing for this directory, run losant configure to generate this file.'));
  });

  it('should try to export data tables', async function() {
    await buildConfig();
    const deferred = defer();
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/data-tables')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000' })
      .reply(200, {});
    sinon.stub(ssLog, 'stdout').callsFake((message) => {
      deferred.resolve(message);
    });

    require('../../commands/dataTables').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-dataTables.js'),
      'export'
    ]);
    const msg = await deferred.promise;
    msg.should.equal('\u001b[33mMissing\u001b[39m\tNo dataTables found to export.');
  });

  it('should get rows from a data table', async function() {
    await buildConfig();
    const deferred = defer();
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/data-tables')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000' })
      .reply(200, {
        count: 1,
        items: [{
          name: 'Red', columns: [{ name: 'Col1', dataType: 'string', constraint: 'required' }, { name: 'Col2', dataType: 'string', constraint: 'required' }], applicationId: '5b9297591fefb200072e554d', creationDate: '2019-07-15T15:37:15.044Z', lastUpdated: '2019-07-15T15:37:15.044Z', dataTableId: '5d2c9dab16770d0008c013fb', id: '5d2c9dab16770d0008c013fb', summary: { count: 2, size: 264 }, _type: 'dataTable', _links: { self: { href: '/applications/5b9297591fefb200072e554d/data-tables/5d2c9dab16770d0008c013fb' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        perPage: 1000,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 1,
        _type: 'dataTables',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/data-tables' } }
      });

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/data-tables/5d2c9dab16770d0008c013fb/rows')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', limit: 1000, offset: 0 })
      .reply(200, {
        applicationId: '5b9297591fefb200072e554d',
        dataTableId: '5d2c9dab16770d0008c013fb',
        query: {},
        limit: 1000,
        offset: 0,
        sortDirection: 'asc',
        sortColumn: 'id',
        items: [{ Col1: 'yuh', Col2: 'no', updatedAt: '2019-07-15T15:37:21.416Z', createdAt: '2019-07-15T15:37:21.416Z', id: '5d2c9db1bb63290008c0f889' }, { Col1: 'NOT', Col2: 'HERE', updatedAt: '2019-07-15T17:53:06.391Z', createdAt: '2019-07-15T17:53:06.391Z', id: '5d2cbd8216770d0008c01400' }],
        count: 2,
        totalCount: 2
      });


    require('../../commands/dataTables').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-dataTables.js'),
      'export'
    ]);
    let msg = '';
    const stub = sinon.stub(ssLog, 'stdout');
    stub.onCall(0).callsFake((message) => {
      msg += `${message}\n`;
    });
    stub.onCall(1).callsFake((message) => {
      msg += `${message}\n`;
      deferred.resolve();
    });
    await deferred.promise;
    msg.should.equal('\u001b[90mprocessing\u001b[39m\tdataTables/Red-5d2c9dab16770d0008c013fb.csv\n\u001b[32mexported\u001b[39m\tdataTables/Red-5d2c9dab16770d0008c013fb.csv\n');
  });
});
