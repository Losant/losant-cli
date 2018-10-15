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
  }
};
