const { dataTables: params } = require('../../lib/get-download-params');
const printHelp = require('../../lib/print-help');

const helpLines =
[
  'Download all data tables',
  '$ losant datatables download'
];

module.exports = (program) => {
  const subProgram = require('../utils/download')(program, params);

  printHelp(subProgram, helpLines);

  return { helpLines };
};
