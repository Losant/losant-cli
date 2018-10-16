module.exports = {
  experience: {
    commandType: 'views',
    apiType: 'experienceViews',
    localStatusParams: [ '/**/*.hbs' ],
    remoteStatusParams: [ 'views/${viewType}s/${name}.hbs', 'body' ] // eslint-disable-line no-template-curly-in-string
  },
  files: {
    commandType: 'files',
    apiType: 'files',
    localStatusParams: [ '/**/*.*' ],
    remoteStatusParams: [ 'files${parentDirectory}${name}' ] // eslint-disable-line no-template-curly-in-string
  },
  options: {
    directory: [ '-d, --dir <dir>', 'directory to run the command in. (default: current directory)' ],
    config: [ '-c, --config <file>', 'config file to run the command with. (default: "losant.yml")' ],
    dryRun: [ '--dry-run', 'display actions but do not perform them' ]
  }
};
