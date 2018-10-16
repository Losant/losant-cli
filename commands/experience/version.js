const { options } = require('../../lib/constants');
module.exports = (program) => {
  program
    .command('version [version]')
    .option(...options.directory)
    .option(...options.config)
    .option('-l, --list <pattern>', 'list all versions like this pattern')
    .option('-d, --description <description>', 'a description to attach to this version')
    .action(require('../../lib/experience-version'));
};
