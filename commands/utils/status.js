const { getStatusFunc } = require('../../lib');
const { options } = require('../../lib/constants');

module.exports = (program, type, params = {}) => {
  program
    .command('status')
    .option(...options.directory)
    .option(...options.config)
    .option('-r, --remote', `show remote ${type} status`)
    .action(getStatusFunc(params));
};
