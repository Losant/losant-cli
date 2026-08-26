const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname));
const { Command } = require('commander');
const program = new Command('losant datatables');

program.description('Manage Data Tables on Losant for your Application');
program.showHelpAfterError();

commands.forEach((command) => {
  command(program);
});

module.exports = program;
