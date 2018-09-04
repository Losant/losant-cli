const utils = require('../../lib/utils');
const sinon = require('sinon');

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
      utils.logError('YOU DID SOMETHING BAD!');
    });
  });
});
