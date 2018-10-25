const { capitalize } = require('omnibelt');
const printHelp = require('../../lib/print-help');

module.exports = (nameOfCommand, program) => {
  const subProgram = program
    .command('watch')
    .action(require('../../lib/watch-files')(nameOfCommand));
  const helpLines = [
    `Watch your ${capitalize(nameOfCommand)} while you make changes and have them automatically uploaded`,
    `$ losant ${nameOfCommand} watch`
  ];

  printHelp(subProgram, helpLines);

  return { helpLines };
};
