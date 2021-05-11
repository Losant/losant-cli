const {
  sinon,
  nock
} = require('../common');
const path = require('path');
const { defer, sleep } = require('omnibelt');
const inquirer = require('inquirer');
const utils = require('../../lib/utils');

describe('Login Command', () => {
  it('should set the API token', async () => {
    const deferred = defer();
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/auth/ssoDomain')
      .query({
        _actions: 'false',
        _links: 'true',
        _embedded: 'true',
        email: 'fakeemail%40email.com'
      })
      .reply(200, 'true', [ 'Date',
        'Mon, 10 May 2021 15:09:29 GMT',
        'Connection',
        'close',
        'Server',
        'Losant API',
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
        'max-age=31536000'
      ]);

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/whitelabels/domain')
      .reply(200,
        {
          appUrl: 'https://app.losant.com',
          endpointDomain: 'endpoint.onlosant.com'
        },
        [ 'Date',
          'Mon, 10 May 2021 14:42:04 GMT',
          'Content-Type',
          'application/json',
          'Content-Length',
          '56',
          'Connection',
          'close',
          'Server',
          'Losant API',
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
          'max-age=31536000'
        ]
      );

    const stub = sinon.stub(inquirer, 'prompt');
    stub.onCall(0).callsFake((data) => {
      data[0].message.should.equal('Enter Losant email:');
      return Promise.resolve({ email: 'fakeemail@email.com' });
    });

    stub.onCall(1).callsFake((data) => {
      data[0].message.should.equal('This account, fakeemail@email.com, is linked to a Single Sign-On (SSO) provider. Please create a CLI-Scoped User API Token in your Losant account, and then enter it here:');
      deferred.resolve();
      return Promise.resolve({ token: 'token1' });
    });

    require('../../commands/login').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/login.js')
    ]);
    await deferred.promise;

    await sleep(500); // give it a second to right the file...
    const config = await utils.loadUserConfig(false);
    config.should.deepEqual({
      'https://api.losant.com': {
        apiToken: 'token1',
        appUrl: 'https://app.losant.com',
        endpointDomain: 'endpoint.onlosant.com'
      }
    });

  });
});
