
module.exports = {
  experience: {
    commandType: 'experience',
    apiType: 'experienceViews',
    localStatusParams: [ '/**/*.hbs' ],
    remoteStatusParams: [ 'experience/${viewType}s/${name}.hbs', 'body' ] // eslint-disable-line no-template-curly-in-string
  },
  files: {
    commandType: 'files',
    apiType: 'files',
    localStatusParams: [ '/**/*.*' ],
    remoteStatusParams: [ 'files${parentDirectory}${name}', 's3etag', { skipMd5Creation: true } ] // eslint-disable-line no-template-curly-in-string
  },
  options: {
    dryRun: [ '--dry-run', 'display actions but do not perform them' ],
    force: [ '-f, --force', 'force all changes by ignoring modification checking' ]
  }
};
