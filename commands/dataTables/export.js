const { dataTables: params } = require('../../lib/get-export-params');

const helpLines = `
Export a data table
$ losant datatables export
`;

module.exports = (program) => {
  program.addHelpText('after', helpLines);
  require('../utils/export')(program, params);
};
