const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const template = require('lodash-template');
module.exports = {
  experience: {
    commandType: 'experience',
    apiType: 'experienceViews',
    localStatusParams: [ path.join(path.sep, '{components,layouts,pages}', '*.hbs') ],
    // eslint-disable-next-line no-template-curly-in-string
    remoteStatusParams: [
      (resource) => {
        const filename = sanitizeFilename(resource.name);
        return path.join('experience', `${resource.viewType}s`, `${filename}.hbs`);
      },
      'body'
    ]
  },
  files: {
    commandType: 'files',
    apiType: 'files',
    localStatusParams: [ path.join(path.sep, '**') ],
    // eslint-disable-next-line no-template-curly-in-string
    remoteStatusParams: [ template('files${parentDirectory}${name}'), 's3etag', { skipMd5Creation: true } ]
  },
  dataTables: {
    commandType: 'dataTables',
    apiType: 'dataTables',
    localStatusParams: [ path.join(path.sep, '*.csv' )],
    // eslint-disable-next-line no-template-curly-in-string
    remoteStatusParams: [ (resource) => {
      const sanitizedName = sanitizeFilename(resource.name);
      return path.join('dataTables', `${sanitizedName}-${resource.id}.csv`);
    } ]
  },
  options: {
    dryRun: [ '--dry-run', 'display actions but do not perform them' ],
    force: [ '-f, --force', 'force all changes by ignoring modification checking' ],
    viewType: [ '--type <viewType>', 'the type of experience view you want to upload e.g. layouts, pages or components' ]
  }
};
