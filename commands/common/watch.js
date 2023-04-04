const { capitalize } = require('omnibelt');

module.exports = (nameOfCommand, program) => {
  program.addHelpText('after', `
Watch your ${capitalize(nameOfCommand)} while you make changes and have them automatically uploaded
$ losant ${nameOfCommand} watch
`);
  program
    .command('watch')
    .storeOptionsAsProperties()
    .action(require('../../lib/watch-files')(nameOfCommand));
};
