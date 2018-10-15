const { getStatusFunc, constants: { experience: { COMMAND_TYPE, API_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS } } } = require('../../lib');

module.exports = (program) => {
  program
    .command('status')
    .option('-c, --config <file>', 'config file to run the command with')
    .option('-d, --dir <dir>', 'directory to run the command in. (default current directory)')
    .option('-r, --remote', 'show remote file status')
    .action(getStatusFunc({
      apiType: API_TYPE,
      commandType: COMMAND_TYPE,
      localStatusParams: LOCAL_STATUS_PARAMS,
      remoteStatusParams: REMOTE_STATUS_PARAMS
    }));
};
