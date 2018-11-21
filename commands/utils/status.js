const { getStatusFunc } = require('../../lib');
const printHelp = require('../../lib/print-help');

module.exports = (program, type, params = {}) => {
  console.log('utils/status...');// eslint-disable-line no-console
  const subProgram = program
    .command('status')
    .action(getStatusFunc(params));
  const helpLines = [
    'Check status of all experience files',
    `$ losant ${type} status`
  ];
  printHelp(subProgram, helpLines);
  return { helpLines };
};
