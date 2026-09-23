import path from 'path';
import { readdir, readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import pkg from '../../package.json' with { type: 'json' };
import configureProgram from '../../commands/configure/index.js';
import dataTablesProgram from '../../commands/dataTables/index.js';
import experienceProgram from '../../commands/experience/index.js';
import filesProgram from '../../commands/files/index.js';
import loginProgram from '../../commands/login/index.js';
import setTokenProgram from '../../commands/set-token/index.js';

const execFileP = promisify(execFile);
const BIN_DIR = path.resolve(import.meta.dirname, '..', '..', 'bin');
const BIN = path.join(BIN_DIR, 'losant.js');
const NODE_ENV_MODULE = path.resolve(import.meta.dirname, '..', '..', 'lib', 'node-env.js');

// The top level binary declares its groups as git style executable subcommands, so
// `losant files` spawns bin/losant-files.js as its own process. Nothing else in the
// suite runs those files, and a bad import in one only surfaces at that spawn.
const GROUPS = {
  'login': [],
  'set-token': [],
  'configure': [],
  'experience': ['bootstrap', 'download', 'layout', 'status', 'upload', 'version', 'watch'],
  'files': ['download', 'status', 'upload', 'watch'],
  'datatables': ['export']
};

const losant = (...args) => {
  return execFileP(process.execPath, [ BIN, ...args ], {
    env: { ...process.env, NODE_ENV: 'test' }
  });
};

describe('losant binary', () => {
  it('should print its version', async () => {
    const { stdout } = await losant('--version');
    stdout.trim().should.equal(pkg.version);
  });

  it('should list every command group in its help', async () => {
    const { stdout } = await losant('--help');
    Object.keys(GROUPS).forEach((group) => {
      stdout.should.match(new RegExp(`^\\s+${group}\\s+\\S`, 'm'));
    });
  });

  Object.entries(GROUPS).forEach(([ group, subcommands ]) => {
    it(`should run \`losant ${group} --help\``, async () => {
      const { stdout } = await losant(group, '--help');
      stdout.should.match(new RegExp(`losant[- ]${group}`));
      subcommands.forEach((subcommand) => {
        stdout.should.match(new RegExp(`^\\s+${subcommand}\\b`, 'm'));
      });
    });
  });
});

describe('NODE_ENV default', () => {
  // Static imports are evaluated before the importing module's body, and
  // lib/on-death.js branches on NODE_ENV while it is being evaluated. Setting the
  // default from a module keeps it from depending on where in the file it lands,
  // but only if that module is imported before anything that reads the value.
  it('should be the first import of every bin entrypoint', async () => {
    const entrypoints = (await readdir(BIN_DIR)).filter((file) => file.endsWith('.js'));
    entrypoints.length.should.be.greaterThan(0);
    const sources = await Promise.all(entrypoints.map((file) => readFile(path.join(BIN_DIR, file), 'utf8')));
    const firstImports = Object.fromEntries(entrypoints.map((file, index) => {
      const match = sources[index].match(/^import .*$/m);
      return [ file, match ? match[0] : null ];
    }));
    firstImports.should.deepEqual(Object.fromEntries(
      entrypoints.map((file) => [ file, 'import \'../lib/node-env.js\';' ])
    ));
  });

  const nodeEnvUnder = async (env) => {
    const source = `import ${JSON.stringify(pathToFileURL(NODE_ENV_MODULE).href)}; console.log(process.env.NODE_ENV);`;
    const { stdout } = await execFileP(process.execPath, [ '--input-type=module', '-e', source ], { env });
    return stdout.trim();
  };

  it('should fall back to production when NODE_ENV is unset', async () => {
    const { NODE_ENV, ...env } = process.env; // eslint-disable-line no-unused-vars
    (await nodeEnvUnder(env)).should.equal('production');
  });

  it('should leave an already set NODE_ENV alone', async () => {
    (await nodeEnvUnder({ ...process.env, NODE_ENV: 'test' })).should.equal('test');
  });
});

describe('command descriptions', () => {
  const programs = {
    'configure': configureProgram,
    'datatables': dataTablesProgram,
    'experience': experienceProgram,
    'files': filesProgram,
    'login': loginProgram,
    'set-token': setTokenProgram
  };

  // A subcommand with no description is invisible in `losant <group> --help`, which is
  // the only place most people go looking for it.
  Object.entries(programs).forEach(([ name, program ]) => {
    it(`every \`losant ${name}\` subcommand should describe itself`, () => {
      const undescribed = program.commands
        .filter((cmd) => !cmd.description())
        .map((cmd) => cmd.name());
      undescribed.should.deepEqual([]);
    });
  });
});
