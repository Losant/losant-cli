import { capitalize } from 'omnibelt';
import watchFiles from '../../lib/watch-files.js';

export default (nameOfCommand, program) => {
  program.addHelpText('after', `
Watch your ${capitalize(nameOfCommand)} while you make changes and have them automatically uploaded
$ losant ${nameOfCommand} watch
`);
  program
    .command('watch')
    .action(watchFiles(nameOfCommand));
};
