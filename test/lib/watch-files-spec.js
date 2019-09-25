const {
  nock,
  sinon,
  buildConfig,
  processingLog,
  uploadedLog
} = require('../common');
const { defer } = require('omnibelt');
const watch = require('../../lib/watch-files')('files', 1000);
const ssLog = require('single-line-log');
const { ensureDir, writeFile } = require('fs-extra');

describe('#Watch Files', () => {
  it('should process files in the order they were queued', async () => {
    for (let i = 0; i < 3; i++) {

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
      .post('/applications/5b9297591fefb200072e554d/files', { name: 'help.txt', parentDirectory: '/', type: 'file', fileSize: 9, contentType: 'text/plain' })
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
      .post('/applications/5b9297591fefb200072e554d/files', { name: 'yo.txt', parentDirectory: '/', type: 'file', fileSize: 9, contentType: 'text/plain' })
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
      .post('/applications/5b9297591fefb200072e554d/files', { name: 'myFile.txt', parentDirectory: '/mine', type: 'file', fileSize: 9, contentType: 'text/plain' })
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

    for (let i=0; i < 3; i++) {
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
    await buildConfig();
    await ensureDir('files');
    await ensureDir('files/mine');

    const deferred = defer();
    const messages = [];

    sinon.stub(ssLog, 'stdout').callsFake((message) => {
      messages.push(message);
      if (messages.length >=11) {
        deferred.resolve();
      }
    });

    await watch();
    await Promise.all([
      writeFile('files/help.txt', 'hello mom'),
      writeFile('files/yo.txt', 'hello dad'),
      writeFile('files/mine/myFile.txt', 'hello son')
    ]);

    await deferred.promise;
    messages.length.should.equal(11);
    const queueing = messages.slice(1, 4);
    const processing = messages.slice(5, 12);
    const fileOrder = [];

    queueing.forEach((msg, index) => {
      const fileName = msg.substring(queueing[index].indexOf('on ')+3, queueing[index].indexOf(','));
      fileOrder[index] = fileName;
    });

    let index = 0;
    fileOrder.forEach((file) => {
      processing[index].should.equal(processingLog(file));
      index++;
      processing[index].should.equal(uploadedLog(file));
      index++;
    });
  });
});
