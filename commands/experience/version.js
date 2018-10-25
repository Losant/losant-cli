module.exports = (program) => {
  program
    .command('version [version]')
    .option('-l, --list <pattern>', 'list all versions like this pattern')
    .option('-d, --description <description>', 'a description to attach to this version')
    .action(require('../../lib/experience-version'));

  return {
    helpLines: [
      'List all of your current experience versions',
      '$ losant experience version',
      'List all of your experience versions that match a pattern',
      '$ losant experience version -l v1.*',
      'Create a new experience version',
      '$ losant experience version v1.0.0',
      'Create a new experience version with a description',
      '$ losant experience version v1.0.1 -d "updated home page"'
    ]
  };
};
