const utils     = require('../../lib/utils');
const { merge } = require('omnibelt');
const fs        = require('fs');

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
    it('.loadConfig', () => {
      const filepath = '../test/fixtures/losant.yaml';
      const config = utils.loadConfig(filepath);
      config.should.deepEqual({
        losant: {
          applicationId: '12345abcdefg',
          losantKey: 'aSecretKeySSSHHH' // just for you, @mk
        },
        file: filepath
      });
    });
    it('.saveConfig', () => {
      const config = { losant: { abc: 'bar', foo: 1234 } };
      const file = '../test/fixtures/save-config.yaml';
      utils.saveConfig(file, config);
      const result = utils.loadConfig(file);
      result.should.deepEqual(merge(config, { file }));
    });
  });
  describe('Meta Data', () => {
    it('should save and load meta data', () => {
      // to do clean up after this test create a file.
      const meta = {
        file1: 'abcde1234',
        file2: '1234abdcde',
        file3: 'efghi12345'
      };
      utils.saveLocalMeta('files', meta);
      const result = utils.loadLocalMeta('files');
      result.should.deepEqual(meta);
    });
  });
  describe('isFileNewer', () => {
    let file;
    afterEach(() => {
      if (file) {
        fs.unlinkSync(file);
        file = null;
      }
    });
    it('should return false if it does not exist', () => {
      utils.isFileNewer('some-file-that-does-not-exist.yaml').should.equal(false);
    });
    it('should return true if the file was created after the date', () => {
      file = './new-file.yaml';
      fs.writeFileSync(file, 'hello world');
      utils.isFileNewer(file, new Date(Date.now() - 24 * 60 * 60 * 1000)).should.be.true();
    });
  });
  describe('Checksum', () => {
    it('should create a hash', () => {
      utils.checksum('helloworld').should.equal('fc5e038d38a57032085441e7fe7010b0');
    });
  });
});
