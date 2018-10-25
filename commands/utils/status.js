const { getStatusFunc } = require('../../lib');
const { options } = require('../../lib/constants');
const printHelp = require('../../lib/print-help');

module.exports = (program, type, params = {}) => {
  let subProgram = program
    .command('status')
    .option('-r, --remote', `show remote ${type} status`)
    .action(getStatusFunc(params));
  const helpLines = [
    'Check local modification status',
    `$ losant ${type} status`,
    'Check remote modification status',
    `$ losant ${type} status -r`
  ];
  printHelp(subProgram, helpLines);
  return { helpLines };
};
