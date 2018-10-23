const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname));
const commonCommands = Object.values(require('../common'));
const program = require('commander');
const printHelp = require('../../lib/print-help');
program.description('Manage Losant Files from the command line');
const help = [];
commands.forEach((command) => {
  const { helpLines } = command(program);
  help.push(...helpLines);
});
commonCommands.forEach((command) => {
  const { helpLines } = command('files', program);
  help.push(...helpLines);
});

printHelp(program, help);

module.exports = program;
