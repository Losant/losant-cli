/* eslint-disable no-template-curly-in-string */
const path = require('path');
module.exports = {
  experience: {
    commandType: 'experience',
    apiType: 'experienceViews',
    localStatusParams: [ path.join(path.sep, '{components,layouts,pages}', '*.hbs') ],
    remoteStatusParams: [ path.join('experience', '${viewType}s', '${name}.hbs'), 'body' ]
  },
  files: {
    commandType: 'files',
    apiType: 'files',
    localStatusParams: [ path.join(path.sep, '**') ],
    remoteStatusParams: [ 'files${parentDirectory}${name}', 's3etag', { skipMd5Creation: true } ]
  },
  dataTables: {
    commandType: 'dataTables',
    apiType: 'dataTables',
    localStatusParams: [ path.join('data-tables', '${name}.csv' )],
    remoteStatusParams: [ path.join('data-tables', '${name}.csv')]
  },
  options: {
    dryRun: [ '--dry-run', 'display actions but do not perform them' ],
    force: [ '-f, --force', 'force all changes by ignoring modification checking' ],
    viewType: [ '--type <viewType>', 'the type of experience view you want to upload e.g. layouts, pages or components' ]
  }
};
