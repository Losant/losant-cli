const { files: params } = require('../../lib/get-download-params');

const helpLines = `
Download all files
$ losant files download
Download files in images directory
$ losant files download images/*
Force a download of all files overwriting local modifications
$ losant files download -f
`;

module.exports = (program) => {
  program.addHelpText('after', helpLines);
  require('../utils/download')(program, params);
};
