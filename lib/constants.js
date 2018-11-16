const path = require('path');
module.exports = {
  experience: {
    commandType: 'experience',
    apiType: 'experienceViews',
    localStatusParams: [ path.join(path.sep, '{components,layouts,pages}', '*.hbs') ],
    remoteStatusParams: [ path.join('experience', '${viewType}s', '${name}.hbs'), 'body' ] // eslint-disable-line no-template-curly-in-string
  },
  files: {
    commandType: 'files',
    apiType: 'files',
    localStatusParams: [ path.join(path.sep, '**') ],
    remoteStatusParams: [ 'files${parentDirectory}${name}', 's3etag', { skipMd5Creation: true } ] // eslint-disable-line no-template-curly-in-string
  },
  options: {
    dryRun: [ '--dry-run', 'display actions but do not perform them' ],
    force: [ '-f, --force', 'force all changes by ignoring modification checking' ],
    viewType: [ '--type <viewType>', 'the type of experience view you want to upload e.g. layouts, pages or components' ]
  }
};
