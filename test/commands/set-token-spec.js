import {
  sinon,
  nock
} from '../common.js';
import path from 'path';
import { defer, sleep } from 'omnibelt';
import inquirer from 'inquirer';
import utils from '../../lib/utils.js';
import setTokenProgram from '../../commands/set-token/index.js';

describe('Set Token Command', () => {
  it('should set the API token', async () => {
    const deferred = defer();
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
      data[0].message.should.equal('Enter a Losant User API token:');
      deferred.resolve();
      return Promise.resolve({ token: 'token1' });
    });

    setTokenProgram.parse([
      '/bin/node',
      path.resolve(import.meta.dirname, '/bin/set-token.js')
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

  it('should set the API token without being prompted', async () => {
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

    setTokenProgram.parse([
      '/bin/node',
      path.resolve(import.meta.dirname, '/bin/set-token.js'),
      'token1'
    ]);

    await sleep(500); // give it a second to right the file...
    const config = await utils.loadUserConfig(false);
    config.should.deepEqual({
      'https://api.losant.com': {
        apiToken: 'token1',
        appUrl: 'https://app.losant.com',
        endpointDomain: 'endpoint.onlosant.com'
      }
    });

  }).timeout(30000);
});
