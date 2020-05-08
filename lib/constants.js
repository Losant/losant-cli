const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const template = require('lodash-template');

module.exports = {
  experience: {
    commandType: 'experience',
    apiType: 'experienceViews',
    localStatusParams: [ path.join(path.sep, '{components,layouts,pages}', '*.hbs') ],
    remoteStatusParams: [
      (resource, { newFilesSet = new Set(), currentFileMap }) => {
        let localStatus;
        for (const [ , value ] of currentFileMap) {
          if (value.id === resource.id && (!value.name || value.name === resource.name)) {
            localStatus = value;
            break;
          }
        }
        if (localStatus) {
          return localStatus.file;
        }
        const dir = path.join('experience', `${resource.viewType}s`);
        let filename = sanitizeFilename(resource.name);
        if (!filename) {
          filename = resource.id;
        }
        const filePath = path.join(dir, `${filename}.hbs`);
        if (!newFilesSet.has(filePath) && !currentFileMap.has(filePath)) {
          return filePath;
        } else {
          let counter = 1;
          let counterFilePath = path.join(dir, `${filename}-${counter}.hbs`);
          while (currentFileMap.get(counterFilePath) || newFilesSet.has(counterFilePath)) {
            counterFilePath = path.join(dir, `${filename}-${counter}.hbs`);
            counter++;
          }
          return counterFilePath;
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
