const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname));
const commonCommands = Object.values(require('../common'));
const program = require('commander');
const { log } = require('../../lib/utils');

program.description('Manages your Losant Application\'s Experience Views, Domains and Versions from the command line');

const help =  [];
commands.forEach((command) => {
  const { helpLines } = command(program) || {};
  if (helpLines) {
    help.push(...helpLines);
  }
});

commonCommands.forEach((command) => { command('experience', program); });


program.on('--help', () => {
  log('');
  log('  Examples:');
  log('');
  log('    Download all experience views (components, layouts and pages)');
  log('     $ losant experience download \n');
  log('    Download component views');
  log('     $ losant experience download components/* \n');
  log('    Force a download of all views overwriting local modifications');
  log('     $ losant experience download -f \n');
  log('    Check local modification status');
  log('     $ losant experience status \n');
  log('    Check remote modification status');
  log('     $ losant experience status -r \n');
  log('    Upload all view');
  log('     $ losant experience upload \n');
  log('    Upload component view');
  log('     $ losant experience upload components/* \n');
  log('    Force an upload of all views overwriting remote modifications');
  log('     $ losant experience upload -f \n');
  log('');
});
module.exports = program;
