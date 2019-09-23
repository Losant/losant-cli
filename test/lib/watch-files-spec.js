const {
  sinon,
  buildConfig
} = require('../common');
const { defer } = require('omnibelt');
const watch = require('../../lib/watch-files')('files', '../files');
const ssLog = require('single-line-log');
const { outputFile } = require('fs-extra');

describe('#Watch Files', () => {
  it('should enqueue changed files', async () => {
    await buildConfig();
    const deferred = defer();

    const messages = [];
    sinon.stub(ssLog, 'stdout').callsFake((message) => {
      messages.push(message);
      if (messages.length >= 4) {
        deferred.resolve();
      }
    });
    await watch();

    await outputFile('../files/newFile.txt', 'hello world');
    await outputFile('../files/nesting/newFile.txt', 'hello world');
    await outputFile('../files/newFile2.txt', 'hello world');

    await deferred.promise;
    messages.length.should.equal(4);
  });
});
