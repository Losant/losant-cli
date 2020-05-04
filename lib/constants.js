const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const template = require('lodash-template');

module.exports = {
  experience: {
    commandType: 'experience',
    apiType: 'experienceViews',
    localStatusParams: [ path.join(path.sep, '{components,layouts,pages}', '*.hbs') ],
    remoteStatusParams: [
      (resource, { newFilesSet = new Set(), currentFileMap, skipIdCheck = false }) => {
        const dir = path.join('experience', `${resource.viewType}s`);
        const unsanitizeFilename = path.join(dir, `${resource.name}.hbs`);
        if (currentFileMap.has(unsanitizeFilename)) {
          if (skipIdCheck || currentFileMap.get(unsanitizeFilename).id === resource.id) {
            // if the unsanitized version of the file already exists just keep it.
            return unsanitizeFilename;
          }
        }
        const filename = sanitizeFilename(resource.name);
        if (!filename) {
          return path.join(dir, `${resource.id}.hbs`);
        }
        const filePath = path.join(dir, `${filename}.hbs`);
        if (currentFileMap.has(filePath)) {
          if (skipIdCheck || currentFileMap.get(filePath).id === resource.id) {
            // if the unsanitized version of the file already exists just keep it.
            return filePath;
          }
        }
        if (!newFilesSet.has(filePath)) {
          return filePath;
        } else {
          let counter = 0;
          let counterFilename = path.join(dir,  `${filename}-${counter}.hbs`);
          while (currentFileMap.get(counterFilename) || newFilesSet.has(counterFilename)) {
            counterFilename = path.join(dir, `${filename}-${counter}.hbs`);
            counter++;
          }
          return counterFilename;
        }
      },
      'body'
    ]
  },
  files: {
    commandType: 'files',
    apiType: 'files',
    localStatusParams: [ path.join(path.sep, '**') ],
    // files never need to be sanitized cause that is ensured in the model
    remoteStatusParams: [ template('files${parentDirectory}${name}'), 's3etag', { skipMd5Creation: true } ]   // eslint-disable-line no-template-curly-in-string
  },
  dataTables: {
    commandType: 'dataTables',
    apiType: 'dataTables',
    localStatusParams: [ path.join(path.sep, '*.csv' )],
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
