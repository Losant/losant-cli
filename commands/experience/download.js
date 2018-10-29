const { experience: params } = require('../../lib/get-download-params');
const printHelp = require('../../lib/print-help');

const helpLines = [
  'Download all experience views (components, layouts and pages)',
  '$ losant experience download',
  'Download component views',
  '$ losant experience download components/*',
  'Force a download of all views overwriting local modifications',
  '$ losant experience download -f'
];


module.exports = (program) => {
  const subProgram = require('../utils/download')(program, params);
  printHelp(subProgram, helpLines);
  return { helpLines };
};
