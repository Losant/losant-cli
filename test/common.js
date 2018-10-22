const utils = require('../lib/utils');
const sinon = require('sinon');
const nock = require('nock');
const c = require('chalk');
const pad = require('pad');
const { promisify } = require('util');
const rimraf = require('rimraf');
const program = require('commander');
const rmDir = promisify(rimraf);
const { pathExists, remove } = require('fs-extra');
process.env.LOSANT_API_URL = process.env.LOSANT_API_URL || 'https://api.losant.space';

const downloadLog = (msg) => { return `${pad(c.green('downloaded'), 13)}\t${msg}`; };
const uplaodedLog = (msg) => { return `${pad(c.green('uploaded'), 13)}\t${msg}`; };
const unmodifiedLog = (msg) => { return `${`${pad(c.gray('unmodified'), 13)}\t${msg}`}`; };
const modifiedLog = (msg) => { return `${`${pad(c.yellow('modified'), 13)}\t${msg}`}`; };
const deletedLog = (msg) => { return `${`${pad(c.redBright('deleted'), 13)}\t${msg}`}`; };
const deletedUploadLog = (msg) => { return `${`${pad(c.yellow('deleted'), 13)}\t${msg}`}`; };
const processingLog = (msg) => { return `${pad(c.gray('processing'), 13)}\t${msg}`; };
const conflictLog = (msg) => { return `${pad(c.redBright('conflict'), 13)}\t${msg}`; };
const errorLog = (msg) => { return `${c.redBright('Error')} ${msg}`; };
const addedLog = (msg) => { return `${pad(c.green('added'), 13)}\t${msg}`; };
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
  // in order to get a clean commander start every time.
  program.commands = [];
  program.options = [];
  program._execs = {};
  program._allowUnknownOption = false;
  program._args = [];
  program._name = '';
  program._description = '';
  delete program.rawArgs;
  delete program.args;
  delete program._events;
  delete program._argsDescription;
  delete program._eventsCount;
  await deleteFakeData();
  await sandbox.restore();
  nock.disableNetConnect();
  nock.cleanAll();
});

after(async () => {
  await deleteFakeData();
  nock.cleanAll();
});

module.exports = {
  rmDir,
  nock,
  sinon: sandbox,
  downloadLog,
  uplaodedLog,
  unmodifiedLog,
  modifiedLog,
  deletedLog,
  deletedUploadLog,
  processingLog,
  conflictLog,
  errorLog,
  addedLog
};
