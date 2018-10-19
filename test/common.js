const utils = require('../lib/utils');
const sinon = require('sinon');
const nock = require('nock');
const { promisify } = require('util');
const rimraf = require('rimraf');
const rmDir = promisify(rimraf);
const { pathExists, remove } = require('fs-extra');
process.env.LOSANT_API_URL = process.env.LOSANT_API_URL || 'https://api.losant.space';

const deleteFakeData = () => {
  return Promise.all(['experience', 'files', 'views', '.losant', 'losant.yml'].map(async (folder) => {
    if (await pathExists(`./${folder}`)) {
      return remove(`./${folder}`);
    }
  }));
};

const sandbox = sinon.createSandbox();

before(() => {
  utils.setDir({ dir: './test' });
});

beforeEach(async () => {
  await deleteFakeData();
  await sandbox.restore();
  nock.disableNetConnect();
  nock.cleanAll();
});

module.exports = {
  rmDir,
  nock,
  sinon: sandbox
};
