const utils = require('../../lib/utils');
const sinon = require('sinon');

describe('utils', () => {
  describe('logging', () => {
    let mock;
    beforeEach(() => {
      mockConsole = sinon.mock(console);
    });
    afterEach(() => {
      mockConsole.restore();
    })
    // TODO mock console.log
    // Or spy on console.log
    it('.log', () => {
      mockConsole.expects('log').atLeast(1);
      utils.log('a message');
      mockConsole.verify();
    });
    it('.logProcessing', () => {

    });
    it('.logResult', () => {

    });
    it('.logError', () => {

    });
  });
});
