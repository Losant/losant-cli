const { getDownloader } = require('../../lib');


module.exports = (program, params = {}) => {

  program
    .command('download [pattern]')
    .option('-f, --force', 'force all changes by ignoring modification checking')
    .option('-c, --config <file>', 'config file to run the command with. (default: "losant.yml")')
    .option('-d, --dir <dir>', 'directory to run the command in. (default: current directory)')
    .option('--dry-run', 'display actions but do not perform them')
    .action(getDownloader(params));
};
