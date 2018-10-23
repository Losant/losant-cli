const { getUploader } = require('../../lib');
const { options } = require('../../lib/constants');

module.exports = (program, params) => {
  program
    .command('upload [pattern]')
    .option(...options.directory)
    .option(...options.config)
    .option(...options.force)
    .option(...options.dryRun)
    .action(getUploader(params));
};
