const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname)).join(Object.values(fromFiles(null, '../common')));
const program = require('commander');
const { log } = require('../../lib/utils');
program.description('Manage Losant Files from the command line');

commands.forEach((command) => { command(program); });

program.on('--help', () => {
  log('');
  log('  Examples:');
  log('');
  log('    Download all files');
  log('     $ losant files download \n');
  log('    Download files in images directory');
  log('     $ losant files download images/* \n');
  log('    Force a download of all files overwriting local modifications');
  log('     $ losant files download -f \n');
  log('    Check local modification status');
  log('     $ losant files status \n');
  log('    Check remote modification status');
  log('     $ losant files status -r \n');
  log('    Upload all files');
  log('     $ losant files upload \n');
  log('    Upload files in images directory');
  log('     $ losant files upload images/* \n');
  log('    Force an upload of all files overwriting remote modifications');
  log('     $ losant files upload -f \n');
  log('');
});

module.exports = program;
