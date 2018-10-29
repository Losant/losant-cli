const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname));
const commonCommands = Object.values(require('../common'));
const p = require('commander');
const program = new p.Command('losant experience');
const printHelp = require('../../lib/print-help');

program.description('Manages your Losant Application\'s Experience Views, and Versions from the command line.');

const help =  [];
commands.forEach((command) => {
  const { helpLines } = command(program) || {};
  if (helpLines) {
    help.push(...helpLines);
  }
});

commonCommands.forEach((command) => {
  const { helpLines } = command('experience', program) || {};
  if (helpLines) {
    help.push(...helpLines);
  }
});

printHelp(program, help);
module.exports = program;
