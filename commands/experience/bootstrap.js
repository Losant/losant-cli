const printHelp = require('../../lib/print-help');
const helpLines = [
  'To generate our standard experience starter views',
  '$ losant experience bootstrap'
];
module.exports = (program) => {
  const subProgram = program
    .command('bootstrap')
    .action(require('../../lib/experience-bootstrap'));

  printHelp(subProgram, helpLines);
  return { helpLines };
};
