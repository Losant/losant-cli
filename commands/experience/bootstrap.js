import experienceBootstrap from '../../lib/experience-bootstrap.js';

const helpLines = `
To generate our standard experience starter views
$ losant experience bootstrap`;

export default (program) => {
  program.addHelpText('after', helpLines);
  program
    .command('bootstrap')
    .action(experienceBootstrap);
};
