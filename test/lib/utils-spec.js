const { buildUserConfig, nock } = require('../common');
const utils     = require('../../lib/utils');
const { merge } = require('omnibelt');
const { writeFile, remove, pathExists } = require('fs-extra');
const should = require('should');
const path = require('path');
const jwt = require('jsonwebtoken');

describe('utils', () => {
  describe('logging', () => {
    it('.log', () => {
      utils.log('a message');
    });
    it('.logProcessing', () => {
      utils.logProcessing('a message');
    });
    it('.logResult', () => {
      utils.logResult('success', 'a result', 'green');
      utils.logResult('should not explode when color is unknown', 'a result', 'blahblah');
    });
    it('.logError', () => {
      utils.logError({ message: 'YOU DID SOMETHING BAD!' });
    });
  });
  describe('Configuration', () => {
    let ogUrl;
    const file = path.resolve(__dirname, 'save-config.yaml');
    before(() => {
      ogUrl = process.env.LOSANT_API_URL;
    });
    afterEach(async () => {
      utils.unlockConfigSync(file);
      if (await pathExists(file)) {
        return remove(file);
      }
    });
    after(() => {
      process.env.LOSANT_API_URL = ogUrl;
    });
    it('.saveConfig and .loadConfig', async () => {
      const config = {
        apiUrl: 'https://api.losant.com',
        applicationId: '5b9297591fefb200072e554d'
      };
      await utils.saveConfig(file, config);
      await buildUserConfig();
      const result = await utils.loadConfig(file);
      should.exist(result.api);
      delete result.api;
      result.should.deepEqual(merge(config, { file, apiToken: 'token', appUrl: 'https://app.losant.com', endpointDomain: 'on.losant.com' }));
    });
    it('.loadConfig should update old config files', async () => {
      process.env.LOSANT_API_URL = 'https://host.com';
      const token = jwt.sign({
        data: 'foobar'
      }, 'sssshhhitsasecret', { issuer: 'host.com' });
      nock('https://host.com', { encodedQueryParams: true })
        .get('/whitelabels/domain')
        .reply(200, { appUrl: 'https://app.host.com', endpointDomain: 'on.host.com' });
      await utils.saveUserConfig({ apiToken: token });
      const userConfig = await utils.loadUserConfig();
      userConfig.should.deepEqual({
        'https://host.com': {
          apiToken: token,
          endpointDomain: 'on.host.com',
          appUrl: 'https://app.host.com'
        }
      });
      const config = {
        applicationId: '5b9297591fefb200072e554d',
        apiUrl: 'https://host.com'
      };
      await utils.saveConfig(file, config);
      const result = await utils.loadConfig(file);
      should.exist(result.api);
      delete result.api;
      result.should.deepEqual({
        file,
        applicationId: '5b9297591fefb200072e554d',
        apiUrl: 'https://host.com',
        endpointDomain: 'on.host.com',
        appUrl: 'https://app.host.com',
        apiToken: token
      });
    });
  });
  describe('Meta Data', () => {
    it('should save and load meta data', async () => {
      // to do clean up after this test create a file.
      const meta = {
        file1: 'abcde1234',
        file2: '1234abdcde',
        file3: 'efghi12345'
      };
      await utils.saveLocalMeta('files', meta);
      const result = await utils.loadLocalMeta('files');
      result.should.deepEqual(meta);
    });
  });
  describe('isFileNewer', () => {
    let file;
    afterEach(async () => {
      if (file) {
        await remove(file);
        file = null;
      }
    });
    it('should return false if it does not exist', async () => {
      (await utils.isFileNewer('some-file-that-does-not-exist.yaml')).should.equal(false);
    });
    it('should return true if the file was created after the date', async () => {
      file = './new-file.yaml';
      await writeFile(file, 'hello world');
      (await utils.isFileNewer(file, new Date(Date.now() - 24 * 60 * 60 * 1000))).should.be.true();
    });
  });
  describe('Checksum', () => {
    it('should create a hash', () => {
      utils.checksum('helloworld').should.equal('fc5e038d38a57032085441e7fe7010b0');
    });
  });
  describe('getComparativeStatus', () => {
    it('should return unmodified for both and conflict false', () => {
      const remoteInfo = { status: 'unmodified' };
      const localInfo = { status: 'unmodified' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('unmodified');
      remoteStatus.should.equal('unmodified');
      conflict.should.equal(false);
    });
    it('should return missing for local and conflict false', () => {
      const remoteInfo = { status: 'added' };
      const localInfo = {};
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('missing');
      remoteStatus.should.equal('added');
      conflict.should.equal(false);
    });
    it('should return missing for remote and conflict false', () => {
      const remoteInfo = {};
      const localInfo = { status: 'added' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('added');
      remoteStatus.should.equal('missing');
      conflict.should.equal(false);
    });
    it('should return deleted for both and conflict false', () => {
      const remoteInfo = { status: 'deleted' };
      const localInfo = { status: 'deleted' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('deleted');
      remoteStatus.should.equal('deleted');
      conflict.should.equal(false);
    });
    it('should return conflict true, when deleted remotely and modified locally', () => {
      const remoteInfo = { status: 'deleted' };
      const localInfo = { status: 'modified' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('modified');
      remoteStatus.should.equal('deleted');
      conflict.should.equal(true);
    });
    it('should return conflict true, when deleted locally and modified remotely', () => {
      const remoteInfo = { status: 'modified' };
      const localInfo = { status: 'deleted' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('deleted');
      remoteStatus.should.equal('modified');
      conflict.should.equal(true);
    });
    it('should return conflict true, when both are modified and md5 does not match', () => {
      const remoteInfo = { status: 'modified', remoteMd5: 'abc' };
      const localInfo = { status: 'modified', localMd5: 'cde' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('modified');
      remoteStatus.should.equal('modified');
      conflict.should.equal(true);
    });
    it('should return conflict true, when both are added and md5 does not match', () => {
      const remoteInfo = { status: 'added', remoteMd5: 'abc' };
      const localInfo = { status: 'added', localMd5: 'cde' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('added');
      remoteStatus.should.equal('added');
      conflict.should.equal(true);
    });
    it('should return conflict false, when both are added and md5 does match', () => {
      const remoteInfo = { status: 'added', md5: 'abc' };
      const localInfo = { status: 'added', md5: 'abc' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('added');
      remoteStatus.should.equal('added');
      conflict.should.equal(false);
    });
    it('should return conflict false, when both are modified and md5 does match', () => {
      const remoteInfo = { status: 'modified', md5: 'abc' };
      const localInfo = { status: 'modified', md5: 'abc' };
      const { localStatus, remoteStatus, conflict } = utils.getComparativeStatus(localInfo, remoteInfo);
      localStatus.should.equal('modified');
      remoteStatus.should.equal('modified');
      conflict.should.equal(false);
    });
  });
});
