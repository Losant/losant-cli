const utils     = require('../../lib/utils');
const { merge } = require('omnibelt');
const { writeFile, deleteFile } = require('../../lib/promise-fs');

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
  describe('Config', () => {
    it('.loadConfig', async () => {
      const filepath = './fixtures/save-config.yaml';
      const config = await utils.loadConfig(filepath);
      config.should.deepEqual({
        applicationId: '5b9297591fefb200072e554d',
        apiToken: 'token',
        file: filepath
      });
    });
    it('.saveConfig', async () => {
      const config = {
        applicationId: '5b9297591fefb200072e554d',
        apiToken: 'token'
      };
      const file = './fixtures/save-config.yaml';
      await utils.saveConfig(file, config);
      const result = await utils.loadConfig(file);
      result.should.deepEqual(merge(config, { file }));
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
      utils.saveLocalMeta('files', meta);
      const result = await utils.loadLocalMeta('files');
      result.should.deepEqual(meta);
    });
  });
  describe('isFileNewer', () => {
    let file;
    afterEach(async () => {
      if (file) {
        await deleteFile(file);
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
});
