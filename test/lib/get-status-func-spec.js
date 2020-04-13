const { nock, sinon, buildConfig, printTable, statusFilesHeaders } = require('../common');
const getStatusFunc   = require('../../lib/get-status-func');
const log             = require('single-line-log');
const c               = require('chalk');
const {
  ensureDir,
  writeFile
} = require('fs-extra');

const API_TYPE = 'experienceViews';
const COMMAND_TYPE = 'views';
const template = require('lodash-template');
const LOCAL_STATUS_PARAMS = [ '/**/*.hbs' ];
const REMOTE_STATUS_PARAMS = [ template('views/${viewType}s/${name}.hbs'), 'body' ]; // eslint-disable-line no-template-curly-in-string

describe('#getStatusFunc', () => {
  it('should log out that there are no local files found', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
      .reply(200, {
        count: 0, items: [], applicationId: '5b9297591fefb200072e554d', perPage: 100, page: 0, sortField: 'name', sortDirection: 'asc', totalCount: 0, _type: 'experienceViews', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Mon, 10 Sep 2018 16:44:05 GMT',
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
    const spy = sinon.spy(log, 'stdout');
    const getStatus = getStatusFunc({ apiType: API_TYPE, commandType: COMMAND_TYPE, localStatusParams: LOCAL_STATUS_PARAMS, remoteStatusParams: REMOTE_STATUS_PARAMS });
    getStatus.should.be.a.Function();
    await buildConfig();
    const command = { };
    await getStatus(command);
    spy.withArgs('No views found.').calledOnce.should.equal(true);
  });
  it('should log out that there are new remote files', async () => {
    const spy = sinon.spy(log, 'stdout');
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
      .reply(200, {
        count: 1,
        items: [
          {
            name: 'Example Layout',
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

    const getStatus = getStatusFunc({ apiType: API_TYPE, commandType: COMMAND_TYPE, localStatusParams: LOCAL_STATUS_PARAMS, remoteStatusParams: REMOTE_STATUS_PARAMS });
    getStatus.should.be.a.Function();
    await buildConfig();
    await getStatus();
    spy.callCount.should.equal(1);
    spy.withArgs(printTable(
      statusFilesHeaders,
      [[ 'Example Layout', 'layouts', c.blue('missing'), c.green('added'), c.gray('no') ]]
    )).calledOnce.should.equal(true);
  });
  it('should log out that there are added local files', async () => {
    await ensureDir('./views/layouts');
    await writeFile('./views/layouts/Example Layout.hbs', 'body');
    const spy = sinon.spy(log, 'stdout');
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
      .reply(200, {
        count: 1,
        items: [
          {
            name: 'Example Layout',
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
    const getStatus = getStatusFunc({ apiType: API_TYPE, commandType: COMMAND_TYPE, localStatusParams: LOCAL_STATUS_PARAMS, remoteStatusParams: REMOTE_STATUS_PARAMS });
    getStatus.should.be.a.Function();
    await buildConfig();
    await getStatus();
    spy.callCount.should.equal(1);
    spy.withArgs(printTable(
      statusFilesHeaders,
      [[ 'Example Layout', 'layouts', c.green('added'), c.green('added'), c.redBright('yes') ]]
    )).calledOnce.should.equal(true);
  });

});
