import getExportParams from '../../lib/get-export-params.js';
import exportCommand from '../utils/export.js';

const { dataTables: params } = getExportParams;

const helpLines = `
Export a data table
$ losant datatables export
`;

export default (program) => {
  program.addHelpText('after', helpLines);
  exportCommand(program, params);
};
