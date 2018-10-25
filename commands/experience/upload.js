const { experience: params } = require('../../lib/get-upload-params');
const printHelp = require('../../lib/print-help');
const helpLines = [
  'Upload all experience views',
  '$ losant experience upload',
  'Upload component view',
  '$ losant experience upload components/*'
];
module.exports = (program) => {
  const subProgram = require('../utils/upload')(program, params);
  printHelp(subProgram, helpLines);
  return { helpLines };
};
