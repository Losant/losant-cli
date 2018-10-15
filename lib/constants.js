module.exports = {
  experience: {
    COMMAND_TYPE: 'views',
    API_TYPE: 'experienceViews',
    LOCAL_STATUS_PARAMS: [ '/**/*.hbs' ],
    REMOTE_STATUS_PARAMS: [ 'views/${viewType}s/${name}.hbs', 'body' ] // eslint-disable-line no-template-curly-in-string
  }
};
