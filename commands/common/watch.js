const { options } = require('../../lib/constants');
module.exports = (program) => {
  program
    .command('watch')
    .option(...options.directory)
    .option(...options.config)
    .action(require('../../lib/watch-files'));
};
