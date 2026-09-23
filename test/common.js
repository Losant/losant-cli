process.env.NODE_ENV = 'test';
process.env.LOSANT_API_URL = process.env.LOSANT_API_URL || 'https://api.losant.com';
process.env.TZ = 'US/Eastern'; // for travis ci to run in eastern
// this is for the utils file and saving the config.
process.env.HOME = import.meta.dirname;
process.env.DIR = import.meta.dirname;
import utils from '../lib/utils.js';
import Table from 'cli-table3';
import { createSandbox } from 'sinon';
import nock from 'nock';
import c from 'chalk';
import locker from 'proper-lockfile';
import fsExtra from 'fs-extra';
import path from 'path';

const { pathExists, readdir, remove } = fsExtra;
const CONFIG_DIR = '.losant';

export const downloadLog = (msg) => { return `${c.green('downloaded'.padEnd(13))}\t${msg}`; };
export const uploadedLog = (msg) => { return `${c.green('uploaded'.padEnd(13))}\t${msg}`; };
export const unmodifiedLog = (msg) => { return `${`${c.gray('unmodified'.padEnd(13))}\t${msg}`}`; };
export const modifiedLog = (msg) => { return `${`${c.yellow('modified'.padEnd(13))}\t${msg}`}`; };
export const deletedLog = (msg) => { return `${`${c.redBright('deleted'.padEnd(13))}\t${msg}`}`; };
export const deletedUploadLog = (msg) => { return `${`${c.yellow('deleted'.padEnd(13))}\t${msg}`}`; };
export const processingLog = (msg) => { return `${c.gray('processing'.padEnd(13))}\t${msg}`; };
export const conflictLog = (msg) => { return `${c.redBright('conflict'.padEnd(13))}\t${msg}`; };
export const errorLog = (msg) => { return `${c.redBright('Error')} ${msg}`; };
export const addedLog = (msg) => { return `${c.green('added'.padEnd(13))}\t${msg}`; };
const deleteFakeData = () => {
  return Promise.all(['experience', 'files', 'dataTables', 'views', '.losant', 'losant.yml'].map(async (folder) => {
    if (await pathExists(`./${folder}`)) {
      return remove(`./${folder}`);
    }
  }));
};

export const printTable = (headers, columns) => {
  headers = headers.map((name) => { return c.magentaBright(name); });
  const table = new Table({ head: headers });

  table.push(...columns);

  return table.toString();
};

export const unlockConfigFiles = (files) => {
  if (!Array.isArray(files)) { files = [ files ]; }
  return Promise.all(files.map(async (file) => {
    file = path.resolve(import.meta.dirname, CONFIG_DIR, file);
    if ((await pathExists(file)) && locker.checkSync(file)) { locker.unlockSync(file); }
  }));
};

// A lock left behind by a test outlives that test: proper-lockfile keeps stat-ing the
// lockfile every few seconds, and deleteFakeData below removes it out from under that
// refresh, which surfaces as an ECOMPROMISED thrown at whichever test is running then.
// Release whatever is actually held rather than guessing at config file names.
const unlockHeldConfigFiles = async () => {
  const configDir = path.resolve(import.meta.dirname, CONFIG_DIR);
  if (!(await pathExists(configDir))) { return; }
  const held = (await readdir(configDir)).filter((entry) => entry.endsWith('.lock'));
  return unlockConfigFiles(held.map((entry) => path.basename(entry, '.lock')));
};

const sandbox = createSandbox();
export { sandbox as sinon };
export { nock };

export const buildUserConfig = () => {
  return utils.saveUserConfig({ 'https://api.losant.com': { apiToken: 'token', endpointDomain: 'on.losant.com', appUrl: 'https://app.losant.com' } });
};

export const buildConfig = async () => {
  await buildUserConfig();
  const config = {
    applicationId: '5b9297591fefb200072e554d',
    applicationName: 'Test Application',
    apiUrl: 'https://api.losant.com'
  };
  return utils.saveConfig(undefined, config); // let it default
};

export const buildResourceConfig = async (file, config = {}) => {
  return utils.saveConfig(file, config);
};

before(() => {
  process.chdir(path.resolve(import.meta.dirname));
});

beforeEach(async () => {
  await unlockHeldConfigFiles();
  await deleteFakeData();
  if (await pathExists('../.losant')) {
    await remove('../.losant');
  }
  sandbox.restore();
  nock.disableNetConnect();
  nock.cleanAll();
});

afterEach(() => {
  if (!nock.isDone()) {
    throw new Error(`Pending Nocks: ${nock.pendingMocks()}`);
  }
});

after(async () => {
  await unlockHeldConfigFiles();
  await deleteFakeData();
  nock.cleanAll();
});

export const statusExpHeaders = [ 'Name', 'View Type', 'Local Status', 'Remote Status', 'Conflict' ];
export const statusFilesHeaders = [ 'Name', 'Directory', 'Local Status', 'Remote Status', 'Conflict' ];
