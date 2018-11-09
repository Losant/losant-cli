const { experience: params } = require('../../lib/get-upload-params');
const printHelp = require('../../lib/print-help');
const helpLines = [
  'Upload all experience views',
  '$ losant experience upload',
  'Upload only component views',
  '$ losant experience upload --type components /*'
];
module.exports = (program) => {
  const options = [
    [ '--type [viewType]', 'the type of experience view you want to upload e.g. layouts, pages or components', /^(layouts|pages|components)$/i ]
  ];
  const subProgram = require('../utils/upload')(program, params, options);
  printHelp(subProgram, helpLines);
  return { helpLines };
};
