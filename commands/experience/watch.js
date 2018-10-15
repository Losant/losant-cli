module.exports = (program) => {
  program
    .command('watch')
    .option('-c, --config <file>', 'config file to run the command with')
    .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
    .action(require('../../lib/watch-files'));
};
