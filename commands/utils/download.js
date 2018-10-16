const { getDownloader } = require('../../lib');
// const { values, forEach } = require('omnibelt');
const { options } = require('../../lib/constants');

module.exports = (program, params = {}) => {
  program
    .command('download [pattern]')
    .option(...options.directory)
    .option(...options.config)
    .option('-f, --force', 'force all changes by ignoring modification checking')
    .option('--dry-run', 'display actions but do not perform them')
    .action(getDownloader(params));
};
