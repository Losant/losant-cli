module.exports = {
  experience: {
    COMMAND_TYPE: 'views',
    API_TYPE: 'experienceViews',
    LOCAL_STATUS_PARAMS: [ '/**/*.hbs' ],
    REMOTE_STATUS_PARAMS: [ 'views/${viewType}s/${name}.hbs', 'body' ] // eslint-disable-line no-template-curly-in-string
  },
  files: {
    COMMAND_TYPE: 'files',
    API_TYPE: 'files',
    LOCAL_STATUS_PARAMS: [ '/**/*.*' ],
    REMOTE_STATUS_PARAMS: [ 'files${parentDirectory}${name}' ] // eslint-disable-line no-template-curly-in-string
  }
};
