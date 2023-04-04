const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname));
const p = require('commander');
const program = new p.Command('losant datatables');
const printHelp = require('../../lib/print-help');

program.description('Manage Data Tables on Losant for your Application');
// program.showHelpAfterError();

const help =  [];
commands.forEach((command) => {
  const { helpLines } = command(program) || {};
  if (helpLines) {
    help.push(...helpLines);
  }
});
// program.addHelpText('after', help);

// printHelp(program, help);
module.exports = program;
