const { getStatusFunc } = require('../../lib');
const { options } = require('../../lib/constants');

module.exports = (program, type, params = {}) => {
  program
    .command('status')
    .option(...options.config)
    .option('-r, --remote', `show remote ${type} status`)
    .action(getStatusFunc(params));
  const helpLines = [
    'Check local modification status',
    `$ losant ${type} status`,
    'Check remote modification status',
    `$ losant ${type} status -r`
  ];
  return { helpLines };
};
