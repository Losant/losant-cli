const {
  nock, sinon, unlockConfigFiles, buildConfig, printTable, statusExpHeaders
} = require('../common');
const ssLog = require('single-line-log');
const { curry, defer } = require('omnibelt');
const minimatch = require('minimatch');
const getDownloader = require('../../lib/get-downloader');
const getStatusFunc = require('../../lib/get-status-func');
const {
  experience: {
    apiType: API_TYPE,
    commandType: COMMAND_TYPE,
    localStatusParams: LOCAL_STATUS_PARAMS,
    remoteStatusParams: REMOTE_STATUS_PARAMS
  }
} = require('../../lib/constants');
const { writeFile, remove } = require('fs-extra');
const c = require('chalk');
const pad = require('pad');

describe('#getDownloader', () => {
  it('should try to download', async () => {

    for (let i = 0; i < 4; i++) {
      nock('https://api.losant.com:443', { encodedQueryParams: true })
        .get('/applications/5b9297591fefb200072e554d/experience/views')
        .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
        .reply(200, {
          count: 1,
          items: [
            {
              name: 'GET my/new/route',
              description: 'description',
              viewType: 'layout',
              body: 'a body',
              applicationId: '5b9297591fefb200072e554d',
              creationDate: '2018-09-07T15:21:01.223Z',
              lastUpdated: '2018-09-07T15:21:01.234Z',
              viewTags: {},
              experienceViewId: '5b92975dc2f8de0006e2ca93',
              id: '5b92975dc2f8de0006e2ca93',
              _type: 'experienceView',
              _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
            }
          ]
        },
        [ 'Date',
          'Tue, 11 Sep 2018 13:54:18 GMT',
          'Content-Type',
          'application/json',
          'Content-Length',
          '12528',
          'Connection',
          'close',
          'Pragma',
          'no-cache',
          'Cache-Control',
          'no-cache, no-store, must-revalidate',
          'X-Content-Type-Options',
          'nosniff',
          'X-XSS-Protection',
          '1; mode=block',
          'Content-Security-Policy',
          'default-src \'none\'; style-src \'unsafe-inline\'',
          'Access-Control-Allow-Origin',
          '*',
          'Strict-Transport-Security',
          'max-age=31536000' ]);
    }
    const downloader = getDownloader({
      apiType: API_TYPE,
      commandType: COMMAND_TYPE,
      localStatusParams: LOCAL_STATUS_PARAMS,
      remoteStatusParams: REMOTE_STATUS_PARAMS,
      getData: (view) => { return view.body; },
      curriedFilterFunc: curry((pattern, view) => {
        return minimatch(view.name, pattern);
      }),
      isConflictDetected: (item, itemLocalStatus, newLocalFiles) => {
        return (itemLocalStatus && itemLocalStatus.status !== 'unmodified') || newLocalFiles.has(item.file);
      }
    });
    let deferred = defer();
    await buildConfig();
    downloader.should.be.a.Function();
    let message = '';
    let spy = sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
      deferred.resolve();
    });
    const command = {};
    await downloader(null, command);
    await unlockConfigFiles('.application.yml');
    await deferred.promise;
    message.should.equal(`${pad(c.green('downloaded'), 13)}\texperience/layouts/GET mynewroute.hbs`);
    spy.restore();
    deferred = defer();
    message = '';
    spy = sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
      deferred.resolve();
    });
    const getStatus = getStatusFunc({
      apiType: API_TYPE,
      commandType: COMMAND_TYPE,
      localStatusParams: LOCAL_STATUS_PARAMS,
      remoteStatusParams: REMOTE_STATUS_PARAMS
    });
    await getStatus(command);
    await unlockConfigFiles('.application.yml');
    await deferred.promise;
    message.should.equal(printTable(
      statusExpHeaders,
      [[ 'GET my/new/route', 'layout', c.gray('unmodified'), c.gray('unmodified'), c.gray('no') ]]
    ));
    spy.restore();
    deferred = defer();
    message = '';
    spy = sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
      deferred.resolve();
    });
    await writeFile('./experience/layouts/GET mynewroute.hbs', 'write something else to make it modified...');
    await getStatus(command);
    await unlockConfigFiles('.application.yml');
    await deferred.promise;
    message.should.equal(printTable(
      statusExpHeaders,
      [[ 'GET my/new/route', 'layout', c.yellow('modified'), c.gray('unmodified'), c.gray('no') ]]
    ));
    spy.restore();
    await remove('./experience/layouts/GET mynewroute.hbs');
    deferred = defer();
    message = '';
    spy = sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
      deferred.resolve();
    });
    await getStatus(command);
    await unlockConfigFiles('.application.yml');
    await deferred.promise;
    message.should.equal(printTable(
      statusExpHeaders,
      [[ 'GET my/new/route', 'layout', c.red('deleted'), c.gray('unmodified'), c.gray('no') ]]
    ));
  });
});
