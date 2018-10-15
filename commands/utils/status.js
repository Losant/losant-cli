const { getStatusFunc } = require('../../lib');

module.exports = (program, params = {}) => {
  program
    .command('status')
    .option('-c, --config <file>', 'config file to run the command with')
    .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
    .option('-r, --remote', 'show remote file status')
    .action(getStatusFunc(params));
};
