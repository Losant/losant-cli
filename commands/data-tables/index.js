const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname));
const commonCommands = Object.values(require('../common'));
const p = require('commander');
const program = new p.Command('losant datatables');
const printHelp = require('../../lib/print-help');

program.description('do data things');

const help =  [];
commands.forEach((command) => {
  const { helpLines } = command(program) || {};
  if (helpLines) {
    help.push(...helpLines);
  }
});

commonCommands.forEach((command) => {
  const { helpLines } = command('datatables', program) || {};
  if (helpLines) {
    help.push(...helpLines);
  }
});

printHelp(program, help);
module.exports = program;
