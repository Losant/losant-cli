const { getDownloader } = require('../../lib');
const { options } = require('../../lib/constants');

module.exports = (program, params = {}) => {
  return program
    .command('download [pattern]')
    .option(...options.force)
    .option(...options.dryRun)
    .action(getDownloader(params));
};
