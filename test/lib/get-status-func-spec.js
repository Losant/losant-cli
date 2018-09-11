const { nock, sinon } = require('../common');
const getStatusFunc   = require('../../lib/get-status-func');
const log             = require('single-line-log');
const c               = require('chalk');
const pad             = require('pad');
const {
  buildDirectories,
  writeFile
} = require('../../lib/promise-fs');


const API_TYPE = 'experienceViews';
const COMMAND_TYPE = 'views';
const LOCAL_STATUS_PARAMS = [ '/**/*.hbs' ];
const REMOTE_STATUS_PARAMS = [ 'views/${viewType}s/${name}.hbs', 'body' ]; // eslint-disable-line no-template-curly-in-string

describe('#getStatusFunc', () => {
  it('should log out that there are no local files found', async () => {
    const spy = sinon.spy(log, 'stdout');
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
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
    const getStatus = getStatusFunc(API_TYPE, COMMAND_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS);
    getStatus.should.be.a.Function();
    const command = {
      config: './fixtures/losant.yaml'
    };
    await getStatus(command);
    spy.withArgs('No local views found').calledOnce.should.equal(true);
  });
  it('should log out that there are no remote files found', async () => {
    const spy = sinon.spy(log, 'stdout');
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
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
    const getStatus = getStatusFunc(API_TYPE, COMMAND_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS);
    getStatus.should.be.a.Function();
    const command = {
      config: './fixtures/losant.yaml',
      remote: true
    };
    await getStatus(command);
    spy.withArgs('No remote views found').calledOnce.should.equal(true);
  });
  it('should log out that there are new remote files', async () => {
    const spy = sinon.spy(log, 'stdout');
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
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

    const getStatus = getStatusFunc(API_TYPE, COMMAND_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS);
    getStatus.should.be.a.Function();
    const command = {
      config: './fixtures/losant.yaml',
      remote: true
    };
    await getStatus(command);
    spy.callCount.should.equal(1);
    spy.withArgs(`${pad(c.green('added'), 13)}\tviews/layouts/Example Layout.hbs`).calledOnce.should.equal(true);
  });
  it('should log out that there are added local files', async () => {
    await buildDirectories('./views/layouts');
    await writeFile('./views/layouts/Example Layout.hbs', 'body');
    const spy = sinon.spy(log, 'stdout');
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
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
    const getStatus = getStatusFunc(API_TYPE, COMMAND_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS);
    getStatus.should.be.a.Function();
    const command = { config: './fixtures/losant.yaml' };
    await getStatus(command);
    spy.callCount.should.equal(1);
    spy.withArgs(`${pad(c.green('added'), 13)}\tviews/layouts/Example Layout.hbs`).calledOnce.should.equal(true);
  });

});
