const { dataTables: params } = require('../../lib/get-export-params');
const printHelp = require('../../lib/print-help');

const helpLines =
[
  'Export a data table',
  '$ losant datatables export'
];

module.exports = (program) => {
  const subProgram = require('../utils/export')(program, params);

  printHelp(subProgram, helpLines);

  return { helpLines };
};
