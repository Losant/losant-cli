const { getStatusFunc } = require('../../lib');
const { options } = require('../../lib/constants');

module.exports = (program, params = {}) => {
  program
    .command('status')
    .option(...options.directory)
    .option(...options.config)
    .option('-r, --remote', 'show remote file status')
    .action(getStatusFunc(params));
};
