const utils = require('../lib/utils');
const sinon = require('sinon');
const nock = require('nock');
const { promisify } = require('util');
const rimraf = require('rimraf');
const rmDir = promisify(rimraf);
const { fileExists } = require('../lib/promise-fs');

const deleteFakeData = () => {
  return Promise.all(['views', 'files', '.losant'].map(async (folder) => {
    if (await fileExists(`./${folder}`)) {
      return rmDir(`./${folder}`);
    }
  }));
};

before(() => {
  utils.setDir({ dir: './test' });
});

beforeEach(async () => {
  await deleteFakeData();
  sinon.restore();
  nock.disableNetConnect();
});

module.exports = {
  rmDir,
  nock,
  sinon
};
