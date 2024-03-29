const { experience: params } = require('../../lib/get-download-params');
const constants = require('../../lib/constants');

const helpLines = `
Download all experience views (components, layouts and pages)
$ losant experience download
Download component views
$ losant experience download --type components
Download component views with names that start with error
$ losant experience download --type components error*
Force a download of all views overwriting local modifications
$ losant experience download -f
Delete all local experience files and redownload experience
$ losant experience download -r
`;


module.exports = (program) => {
  program.addHelpText('after', helpLines);
  const options = [ constants.options.viewType, constants.options.reset ];

  require('../utils/download')(program, params, options);
};
