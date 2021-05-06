process.env.NODE_ENV = 'test';
process.env.LOSANT_API_URL = process.env.LOSANT_API_URL || 'https://api.losant.com';
process.env.TZ = 'US/Eastern'; // for travis ci to run in eastern
// this is for the utils file and saving the config.
process.env.HOME = __dirname;
process.env.DIR = __dirname;
const utils = require('../lib/utils');
const Table = require('cli-table3');
const sinon = require('sinon');
const nock = require('nock');
const c = require('chalk');
const pad = require('pad');
const { promisify } = require('util');
const rimraf = require('rimraf');
const program = require('commander');
const rmDir = promisify(rimraf);
const locker = require('proper-lockfile');
const { pathExists, remove } = require('fs-extra');
const path = require('path');

const downloadLog = (msg) => { return `${pad(c.green('downloaded'), 13)}\t${msg}`; };
const uploadedLog = (msg) => { return `${pad(c.green('uploaded'), 13)}\t${msg}`; };
const unmodifiedLog = (msg) => { return `${`${pad(c.gray('unmodified'), 13)}\t${msg}`}`; };
const modifiedLog = (msg) => { return `${`${pad(c.yellow('modified'), 13)}\t${msg}`}`; };
const deletedLog = (msg) => { return `${`${pad(c.redBright('deleted'), 13)}\t${msg}`}`; };
const deletedUploadLog = (msg) => { return `${`${pad(c.yellow('deleted'), 13)}\t${msg}`}`; };
const processingLog = (msg) => { return `${pad(c.gray('processing'), 13)}\t${msg}`; };
const conflictLog = (msg) => { return `${pad(c.redBright('conflict'), 13)}\t${msg}`; };
const errorLog = (msg) => { return `${c.redBright('Error')} ${msg}`; };
const addedLog = (msg) => { return `${pad(c.green('added'), 13)}\t${msg}`; };
const deleteFakeData = () => {
  return Promise.all(['experience', 'files', 'dataTables', 'views', '.losant', 'losant.yml'].map(async (folder) => {
    if (await pathExists(`./${folder}`)) {
      return remove(`./${folder}`);
    }
  }));
};

const printTable = (headers, columns) => {
  headers = headers.map((name) => { return c.magentaBright(name); });
  const table = new Table({ head: headers });

  table.push(...columns);

  return table.toString();
};

const unlockConfigFiles = (files) => {
  if (!Array.isArray(files)) { files = [ files ]; }
  return Promise.all(files.map(async (file) => {
    file = path.resolve(__dirname, '.losant', file);
    if ((await pathExists(file)) && locker.checkSync(file)) { locker.unlockSync(file); }
  }));
};

const sandbox = sinon.createSandbox();

const buildUserConfig = () => {
  return utils.saveUserConfig({ 'https://api.losant.com': { apiToken: 'token', endpointDomain: 'on.losant.com', appUrl: 'https://app.losant.com' } });
};

const buildConfig = async () => {
  await buildUserConfig();
  const config = {
    applicationId: '5b9297591fefb200072e554d',
    applicationName: 'Test Application',
    apiUrl: 'https://api.losant.com'
  };
  return utils.saveConfig(undefined, config); // let it default
};

const buildResourceConfig = async (file, config = {}) => {
  return utils.saveConfig(file, config);
};

before(() => {
  process.chdir(path.resolve(__dirname));
});

beforeEach(async () => {
  await unlockConfigFiles(['.losant.yml']);
  await deleteFakeData();
  if (await pathExists('../.losant')) {
    return remove('../.losant');
  }
  await sandbox.restore();
  nock.disableNetConnect();
  nock.cleanAll();
});

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error(`Pending Nocks: ${nock.pendingMocks()}`);
  }
});

const resetCommander = () => {
  // in order to get a clean commander start every time.
  // #theMKway
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
};

after(async () => {
  await deleteFakeData();
  nock.cleanAll();
});

module.exports = {
  rmDir,
  nock,
  sinon: sandbox,
  downloadLog,
  uploadedLog,
  unmodifiedLog,
  modifiedLog,
  deletedLog,
  deletedUploadLog,
  processingLog,
  conflictLog,
  errorLog,
  addedLog,
  resetCommander,
  unlockConfigFiles,
  buildConfig,
  printTable,
  buildUserConfig,
  buildResourceConfig,
  statusExpHeaders: [ 'Name', 'View Type', 'Local Status', 'Remote Status', 'Conflict' ],
  statusFilesHeaders: [ 'Name', 'Directory', 'Local Status', 'Remote Status', 'Conflict' ]
};
