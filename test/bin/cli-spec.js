import path from 'path';
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
const BIN = path.resolve(import.meta.dirname, '..', '..', 'bin', 'losant.js');

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
