const typeError = require('error/typed');

module.exports = {
  MissingUserConfiguration: typeError({
    type: 'MissingUserConfiguration',
    message: 'User Configuration file missing, run losant login to generate this file.'
  }),
  MissingApplicationConfiguration: typeError({
    type: 'MissingApplicationConfiguration',
    message: 'Configuration file missing for this directory, run losant configure to generate this file.'
  }),
  MissingApiKey: typeError({
    type: 'MissingApiKey',
    title: null,
    message: 'Could not find log in information for API {title}, please login again.'
  }),
  AlreadyLocked: typeError({
    type: 'FileLocked',
    title: null,
    message: '{title} is already locked by another process running.'
  }),
  InvalidType: typeError({
    type: 'Invalid Type',
    title: null,
    message: 'Invalid Type: {title}, only valid views types are layouts, pages and components.'
  })
};
