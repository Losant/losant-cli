import { capitalize } from 'omnibelt';
import watchFiles from '../../lib/watch-files.js';

export default (nameOfCommand, program) => {
  program.addHelpText('after', `
Watch your ${capitalize(nameOfCommand)} while you make changes and have them automatically uploaded
$ losant ${nameOfCommand} watch
`);
  return program
    .command('watch')
    .description(`Watch your local ${nameOfCommand === 'experience' ? 'experience views' : nameOfCommand} and upload changes as they happen`)
    .action(watchFiles(nameOfCommand));
};
