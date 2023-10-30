const helpLines = `
List all of your current experience versions
$ losant experience version
List all of your experience versions that match a pattern
$ losant experience version -l v1.*
Create a new experience version
$ losant experience version v1.0.0
Create a new experience version with a description
$ losant experience version v1.0.1 -d "updated home page"
Create a new experience version with a description
$ losant experience version v1.0.1 -d "updated home page"
Create a new experience version associated with specific domain IDs or names
$ losant experience version v1.0.1 -o "653981225c401f279a221eaa,653981225c401f279a221eab,*.foo.bar"
Create a new experience version associated with specific slug IDs or names
$ losant experience version v1.0.1 -s "653981225c401f279a221ebb,mypersonalslug,653981225c401f279a221ebc"
`;

module.exports = (program) => {
  program.addHelpText('after', helpLines);
  program
    .command('version [version]')
    .option('-l, --list <pattern>', 'list all versions like this pattern')
    .option('-d, --description <description>', 'a description to attach to this version')
    .option('-o --domainIds <domainIds>', 'a comma separated list of domain IDs or names')
    .option('-s --slugIds <slugIds>', 'a comma separated list of slug IDs or names')
    .action(require('../../lib/experience-version'));
};
