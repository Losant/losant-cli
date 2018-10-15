const {
  getStatusFunc,
  constants
} = require('../../lib');
const { merge } = require('omnibelt');

module.exports = (program, type, params = {}) => {
  params = merge(constants[type], params);
  program
    .command('status')
    .option('-c, --config <file>', 'config file to run the command with')
    .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
    .option('-r, --remote', 'show remote file status')
    .action(getStatusFunc(params));
};
