const { experience: params } = require('../../lib/get-upload-params');
const constants = require('../../lib/constants');
const helpLines = `
Upload all experience views
$ losant experience upload
Upload only component views
$ losant experience upload --type components /*
`;

module.exports = (program) => {
  program.addHelpText('after', helpLines);
  const options = [ constants.options.viewType ];
  require('../utils/upload')(program, params, options);
};
