const { getStatusFunc } = require('../../lib');
const printHelp = require('../../lib/print-help');

module.exports = (program, type, params = {}) => {
  const subProgram = program
    .command('status')
    .action(getStatusFunc(params));
  const helpLines = [
    `Check status of all ${type === 'experience' ? 'experience views' : type}`,
    `$ losant ${type} status`
  ];
  printHelp(subProgram, helpLines);
  return { helpLines };
};
