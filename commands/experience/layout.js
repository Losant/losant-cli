import experienceLayout from '../../lib/experience-layout.js';

const helpLines = `View all your experience pages with their layouts
$ losant experience layout
View all of your experience pages that match this pattern with their layout
$ losant experience layout -l v1.*
Set a layout for page example
$ losant experience layout example
`;
export default (program) => {
  program.addHelpText('after', helpLines);
  program
    .command('layout [page]')
    .description('View or set the layout used by your experience pages')
    .option('-l, --list <pattern>', 'pages that match this pattern will be listed with their layout')
    .action(experienceLayout);
};
