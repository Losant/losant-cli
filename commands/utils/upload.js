const { getUploader } = require('../../lib');
const { options } = require('../../lib/constants');

module.exports = (program, params) => {
  return program
    .command('upload [pattern]')
    .option(...options.force)
    .option(...options.dryRun)
    .action(getUploader(params));
};
