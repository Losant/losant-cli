import getStatusFunc from '../../lib/get-status-func.js';

export default (program, type, params = {}) => {
  const helpLines = `
Check status of all ${type === 'experience' ? 'experience views' : type}
$ losant ${type} status
`;
  program.addHelpText('after', helpLines);
  return program
    .command('status')
    .description(`Compare your local ${type === 'experience' ? 'experience views' : type} against Losant`)
    .action(getStatusFunc(params));
};
