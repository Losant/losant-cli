const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname));
const commonCommands = Object.values(require('../common'));
const program = require('commander');
const { log } = require('../../lib/utils');

program.description('Manage Losant Experience Views from the command line');

commands.forEach((command) => { command(program); });

commonCommands.forEach((command) => { command('experience', program); });

program.on('--help', () => {
  log('');
  log('  Examples:');
  log('');
  log('    Download all views');
  log('     $ losant views download \n');
  log('    Download component views');
  log('     $ losant views download components/* \n');
  log('    Force a download of all views overwriting local modifications');
  log('     $ losant views download -f \n');
  log('    Check local modification status');
  log('     $ losant views status \n');
  log('    Check remote modification status');
  log('     $ losant views status -r \n');
  log('    Upload all view');
  log('     $ losant views upload \n');
  log('    Upload component view');
  log('     $ losant views upload components/* \n');
  log('    Force an upload of all views overwriting remote modifications');
  log('     $ losant views upload -f \n');
  log('');
});
module.exports = program;
