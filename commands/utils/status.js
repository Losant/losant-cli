const { getStatusFunc } = require('../../lib');

module.exports = (program, type, params = {}) => {
  const helpLines = `
Check status of all ${type === 'experience' ? 'experience views' : type}
$ losant ${type} status
`;
  program.addHelpText('after', helpLines);
  program
    .command('status')
    .storeOptionsAsProperties()
    .action(getStatusFunc(params));
};
