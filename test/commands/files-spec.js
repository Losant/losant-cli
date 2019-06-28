const path = require('path');
const ssLog = require('single-line-log');
const {
  sinon,
  nock,
  downloadLog,
  uploadedLog,
  unmodifiedLog,
  processingLog,
  errorLog,
  resetCommander,
  unlockConfigFiles,
  buildConfig,
  buildUserConfig,
  printTable,
  statusFilesHeaders
} = require('../common');
const { defer } = require('omnibelt');
const { writeFile, ensureFile } = require('fs-extra');
const c = require('chalk');
const CONFIG_FILE = '.application.yml';

describe('Files Commands', () => {

  before(() => {
    resetCommander();
  });

  it('should log an error if configure was not run first', async function() {
    await buildUserConfig();
    const deferred = defer();
    sinon.stub(ssLog, 'stdout').callsFake((message) => {
      deferred.resolve(message);
    });

    require('../../commands/files').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-files.js'),
      'status'
    ]);
    const msg = await deferred.promise;
    msg.should.equal(errorLog('Configuration file missing for this directory, run losant configure to generate this file.'));
  });
  it('should run get status', async function() {
    await buildConfig();
    const deferred = defer();
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/files')
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', type: 'file', page: 0, perPage: 1000
      })
      .reply(200, {
        count: 0,
        items: [],
        perPage: 100,
        page: 0,
        sortField: 'lastUpdated',
        sortDirection: 'asc',
        totalCount: 2,
        _type: 'files',
        _links: { application: { href: '/applications/' }, self: { href: '/applications//files' } }
      }, [ 'Date',
        'Fri, 19 Oct 2018 20:24:18 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '1642',
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
    sinon.stub(ssLog, 'stdout').callsFake((message) => {
      deferred.resolve(message);
    });

    require('../../commands/files').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-files.js'),
      'status'
    ]);
    const msg = await deferred.promise;
    msg.should.equal('No files found.');
  });

  it('should run get status, download, upload', async function() {
    nock('https://files.onlosant.com:443', { encodedQueryParams: true })
      .get('/5b9297591fefb200072e554d/7c_iLKJn.jpg')
      .reply(200, 'helloworld', [ 'Content-Type',
        'image/jpeg',
        'Content-Length',
        '104606',
        'Connection',
        'close',
        'Date',
        'Fri, 19 Oct 2018 20:22:16 GMT',
        'Last-Modified',
        'Fri, 19 Oct 2018 19:19:05 GMT',
        'ETag',
        '"4f9c7fb7da0d50e78b39309ea44329dd"',
        'Accept-Ranges',
        'bytes',
        'Server',
        'AmazonS3',
        'Age',
        '123',
        'X-Cache',
        'Hit from cloudfront',
        'Via',
        '1.1 61e75bd33e6585cb966e70a5677b630b.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Id',
        'jPQs76DzBnKTPR73RdGwDskTR52j1W1p1ag6GZKgtLiGNvdk0A8iGg=='
      ]);

    nock('https://files.onlosant.com:443', { encodedQueryParams: true })
      .get('/5b9297591fefb200072e554d/30442479_1804907812955173_2594707246956191799_n.jpg')
      .reply(200, 'helloworld', [ 'Content-Type',
        'image/jpeg',
        'Content-Length',
        '104606',
        'Connection',
        'close',
        'Date',
        'Fri, 19 Oct 2018 20:22:16 GMT',
        'Last-Modified',
        'Fri, 19 Oct 2018 19:19:05 GMT',
        'ETag',
        '"4f9c7fb7da0d50e78b39309ea44329dd"',
        'Accept-Ranges',
        'bytes',
        'Server',
        'AmazonS3',
        'Age',
        '123',
        'X-Cache',
        'Hit from cloudfront',
        'Via',
        '1.1 61e75bd33e6585cb966e70a5677b630b.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Id',
        'jPQs76DzBnKTPR73RdGwDskTR52j1W1p1ag6GZKgtLiGNvdk0A8iGg=='
      ]);
    for (let i = 0; i < 4; i++) {
      nock('https://api.losant.com:443', { encodedQueryParams: true })
        .get('/applications/5b9297591fefb200072e554d/files')
        .query({
          _actions: 'false', _links: 'true', _embedded: 'true', type: 'file', page: 0, perPage: 1000
        })
        .reply(200, {
          count: 2,
          items: [{
            name: '7c_iLKJn.jpg', parentDirectory: '/', type: 'file', fileSize: 21593, contentType: 'image/jpeg', authorType: 'user', authorId: '59a41ff6b36c040007c6e2eb', applicationId: '5b9297591fefb200072e554d', lastUpdated: '2018-10-17T14:58:32.487Z', creationDate: '2018-10-17T14:58:30.700Z', status: 'completed', s3etag: 'fc5e038d38a57032085441e7fe7010b0', url: 'https://files.onlosant.com/5b9297591fefb200072e554d/7c_iLKJn.jpg', id: '5bc74e16c3f6050008c61638', _type: 'file', _links: { application: { href: '/applications/5b9297591fefb200072e554d' }, files: { href: '/applications/5b9297591fefb200072e554d/files' }, self: { href: '/applications/5b9297591fefb200072e554d/file/' } }
          }, {
            name: '30442479_1804907812955173_2594707246956191799_n.jpg', parentDirectory: '/', type: 'file', fileSize: 104606, contentType: 'image/jpeg', authorType: 'user', authorId: '59a41ff6b36c040007c6e2eb', applicationId: '5b9297591fefb200072e554d', lastUpdated: '2018-10-19T19:19:08.479Z', creationDate: '2018-10-19T19:19:04.642Z', status: 'completed', s3etag: 'fc5e038d38a57032085441e7fe7010b0', url: 'https://files.onlosant.com/5b9297591fefb200072e554d/30442479_1804907812955173_2594707246956191799_n.jpg', id: '5bca2e28ef9fb00007f3938e', _type: 'file', _links: { application: { href: '/applications/5b9297591fefb200072e554d' }, files: { href: '/applications/5b9297591fefb200072e554d/files' }, self: { href: '/applications/5b9297591fefb200072e554d/file/' } }
          }],
          perPage: 100,
          page: 0,
          sortField: 'lastUpdated',
          sortDirection: 'asc',
          totalCount: 2,
          _type: 'files',
          _links: { application: { href: '/applications/' }, self: { href: '/applications//files' } }
        }, [ 'Date',
          'Fri, 19 Oct 2018 20:24:18 GMT',
          'Content-Type',
          'application/json',
          'Content-Length',
          '1642',
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

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .post('/applications/5b9297591fefb200072e554d/files', { name: 'newFile.txt', parentDirectory: '/', type: 'file', fileSize: 11, contentType: 'text/plain' })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(201, {
        name: 'newFile.txt',
        parentDirectory: '/',
        type: 'file',
        fileSize: 11,
        contentType: 'text/plain',
        authorType: 'user',
        authorId: '59a41ff6b36c040007c6e2eb',
        applicationId: '5b9297591fefb200072e554d',
        lastUpdated: '2018-10-19T20:24:19.041Z',
        creationDate: '2018-10-19T20:24:19.039Z',
        status: 'pending',
        url: 'https://files.onlosant.com/5b9297591fefb200072e554d/newFile.txt',
        id: '5bca3d7330307f0007c0e4e3',
        upload: {
          url: 'https://s3.us-west-2.amazonaws.com/files.onlosant.com',
          fields: {
            'Content-Type': 'text/plain', 'key': '5b9297591fefb200072e554d/newFile.txt', 'bucket': 'files.onlosant.com', 'X-Amz-Algorithm': 'AWS4-HMAC-SHA256', 'X-Amz-Credential': 'AKIAI3D42VHS4PYVKJ3Q/20181019/us-west-2/s3/aws4_request', 'X-Amz-Date': '20181019T202419Z', 'Policy': 'eyJleHBpcmF0aW9uIjoiMjAxOC0xMC0xOVQyMToyNDoxOVoiLCJjb25kaXRpb25zIjpbeyJDb250ZW50LVR5cGUiOiJ0ZXh0L3BsYWluIn0seyJrZXkiOiI1NjhiZWVkZWI0MzZhYjAxMDA3YmU1M2QvbmV3RmlsZS50eHQifSx7ImJ1Y2tldCI6ImZpbGVzLm9ubG9zYW50LmNvbSJ9LHsiWC1BbXotQWxnb3JpdGhtIjoiQVdTNC1ITUFDLVNIQTI1NiJ9LHsiWC1BbXotQ3JlZGVudGlhbCI6IkFLSUFJM0Q0MlZIUzRQWVZLSjNRLzIwMTgxMDE5L3VzLXdlc3QtMi9zMy9hd3M0X3JlcXVlc3QifSx7IlgtQW16LURhdGUiOiIyMDE4MTAxOVQyMDI0MTlaIn1dfQ==', 'X-Amz-Signature': 'cdfcf79864d1ed0e32a1bc864a201e986db8793d68baeea4bee5c7252866c2c4'
          }
        },
        _type: 'file',
        _links: { application: { href: '/applications/5b9297591fefb200072e554d' }, files: { href: '/applications/5b9297591fefb200072e554d/files' }, self: { href: '/applications/5b9297591fefb200072e554d/file/' } }
      }, [ 'Date',
        'Fri, 19 Oct 2018 20:24:19 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '1473',
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

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .post('/applications/5b9297591fefb200072e554d/files', { name: 'newFile.txt.other', parentDirectory: '/deep/nested', type: 'file', fileSize: 11, contentType: 'application/octet-stream' })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(201, {
        name: 'newFile.txt.other',
        parentDirectory: '/deep/nested',
        type: 'file',
        fileSize: 11,
        contentType: 'text/plain',
        authorType: 'user',
        authorId: '59a41ff6b36c040007c6e2eb',
        applicationId: '5b9297591fefb200072e554d',
        lastUpdated: '2018-10-19T20:24:19.041Z',
        creationDate: '2018-10-19T20:24:19.039Z',
        status: 'pending',
        url: 'https://files.onlosant.com/5b9297591fefb200072e554d/newFile.txt',
        id: '5bca3d7330307f0007c0e4e4',
        upload: {
          url: 'https://s3.us-west-2.amazonaws.com/files.onlosant.com',
          fields: {
            'Content-Type': 'text/plain', 'key': '5b9297591fefb200072e554d/newFile.txt', 'bucket': 'files.onlosant.com', 'X-Amz-Algorithm': 'AWS4-HMAC-SHA256', 'X-Amz-Credential': 'AKIAI3D42VHS4PYVKJ3Q/20181019/us-west-2/s3/aws4_request', 'X-Amz-Date': '20181019T202419Z', 'Policy': 'eyJleHBpcmF0aW9uIjoiMjAxOC0xMC0xOVQyMToyNDoxOVoiLCJjb25kaXRpb25zIjpbeyJDb250ZW50LVR5cGUiOiJ0ZXh0L3BsYWluIn0seyJrZXkiOiI1NjhiZWVkZWI0MzZhYjAxMDA3YmU1M2QvbmV3RmlsZS50eHQifSx7ImJ1Y2tldCI6ImZpbGVzLm9ubG9zYW50LmNvbSJ9LHsiWC1BbXotQWxnb3JpdGhtIjoiQVdTNC1ITUFDLVNIQTI1NiJ9LHsiWC1BbXotQ3JlZGVudGlhbCI6IkFLSUFJM0Q0MlZIUzRQWVZLSjNRLzIwMTgxMDE5L3VzLXdlc3QtMi9zMy9hd3M0X3JlcXVlc3QifSx7IlgtQW16LURhdGUiOiIyMDE4MTAxOVQyMDI0MTlaIn1dfQ==', 'X-Amz-Signature': 'cdfcf79864d1ed0e32a1bc864a201e986db8793d68baeea4bee5c7252866c2c4'
          }
        },
        _type: 'file',
        _links: { application: { href: '/applications/5b9297591fefb200072e554d' }, files: { href: '/applications/5b9297591fefb200072e554d/files' }, self: { href: '/applications/5b9297591fefb200072e554d/file/' } }
      }, [ 'Date',
        'Fri, 19 Oct 2018 20:24:19 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '1473',
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
    for (let i=0; i < 2; i++) {
      nock('https://s3.us-west-2.amazonaws.com:443', { encodedQueryParams: true })
        .post('/files.onlosant.com', /.*/)
        .reply(204, '', [ 'x-amz-id-2',
          'bgtyS9TMwD4MWmaWcRFviQutaZKHdQWv1icmHjVkUeUYByunN4Ajmti3L2Rz0AH2tHJs0CR6y5c=',
          'x-amz-request-id',
          '9BC74EBBBFE8D047',
          'Date',
          'Fri, 19 Oct 2018 20:24:20 GMT',
          'ETag',
          '"5eb63bbbe01eeed093cb22bb8f5acdc3"',
          'Location',
          'https://s3.us-west-2.amazonaws.com/files.onlosant.com/5b9297591fefb200072e554d%2FnewFile.txt',
          'Server',
          'AmazonS3',
          'Connection',
          'close' ]);
    }
    this.timeout(10000);
    await buildConfig();

    const downloadDefer = defer();
    const downloadMessages = [];
    let spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      downloadMessages.push(message);
      if (downloadMessages.length >= 4) {
        downloadDefer.resolve();
      }
    });
    require('../../commands/files').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-files.js'),
      'download'
    ]);
    await downloadDefer.promise;
    await unlockConfigFiles(CONFIG_FILE);
    spy.restore();
    downloadMessages.length.should.equal(4);
    downloadMessages.sort().should.deepEqual([
      downloadLog('files/30442479_1804907812955173_2594707246956191799_n.jpg'),
      downloadLog('files/7c_iLKJn.jpg'),
      processingLog('files/30442479_1804907812955173_2594707246956191799_n.jpg'),
      processingLog('files/7c_iLKJn.jpg')
    ]);

    let statusDefer = defer();
    let statusMessage = '';


    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      statusMessage = message;
      statusDefer.resolve();
    });
    require('../../commands/files').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-files.js'),
      'status'
    ]);
    await statusDefer.promise;
    await unlockConfigFiles(CONFIG_FILE);

    statusMessage.should.equal(printTable(
      statusFilesHeaders,
      [
        ['30442479_1804907812955173_2594707246956191799_n.jpg', '/', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['7c_iLKJn.jpg', '/', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')]
      ]
    ));
    await writeFile('./files/newFile.txt', 'hello world');
    await ensureFile('./files/deep/nested/newFile.txt.other');
    await writeFile('./files/deep/nested/newFile.txt.other', 'hello world');
    statusDefer = defer();
    statusMessage = '';
    spy.restore();
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      statusMessage = message;
      statusDefer.resolve();
    });
    require('../../commands/files').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-files.js'),
      'status'
    ]);
    await statusDefer.promise;
    await unlockConfigFiles(CONFIG_FILE);
    statusMessage.should.equal(printTable(
      statusFilesHeaders,
      [
        ['30442479_1804907812955173_2594707246956191799_n.jpg', '/', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['7c_iLKJn.jpg', '/', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['newFile.txt.other', 'deep/nested', c.green('added'), c.blue('missing'), c.gray('no')],
        ['newFile.txt', '/', c.green('added'), c.blue('missing'), c.gray('no')]
      ]
    ));
    spy.restore();

    const uploadDefer = defer();
    const uploadMessages = [];
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      uploadMessages.push(message);
      if (uploadMessages.length >= 8) {
        uploadDefer.resolve();
      }
    });
    require('../../commands/files').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-files.js'),
      'upload'
    ]);
    await uploadDefer.promise;
    uploadMessages.length.should.equal(8);
    uploadMessages.sort().should.deepEqual([
      uploadedLog('files/deep/nested/newFile.txt.other'),
      uploadedLog('files/newFile.txt'),
      processingLog('files/30442479_1804907812955173_2594707246956191799_n.jpg'),
      processingLog('files/7c_iLKJn.jpg'),
      processingLog('files/deep/nested/newFile.txt.other'),
      processingLog('files/newFile.txt'),
      unmodifiedLog('files/30442479_1804907812955173_2594707246956191799_n.jpg'),
      unmodifiedLog('files/7c_iLKJn.jpg')
    ]);
  });
});
