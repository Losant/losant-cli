const { fromFiles } = require('@rjhilgefort/export-dir');
const commands = Object.values(fromFiles(null, __dirname));
const commonCommands = Object.values(require('../common'));
const { Command } = require('commander');
const program = new Command('losant experience'); //.storeOptionsAsProperties();

program.description('Manages your Losant Application\'s Experience Views, and Versions from the command line.');
program.showHelpAfterError();

commands.forEach((command) => {
  return command(program) || {};
});

commonCommands.forEach((command) => {
  return command('experience', program) || {};
});

module.exports = program;
