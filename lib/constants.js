const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const template = require('lodash-template');
const { startsWith } = require('omnibelt');
module.exports = {
  experience: {
    commandType: 'experience',
    apiType: 'experienceViews',
    localStatusParams: [ path.join(path.sep, '{components,layouts,pages}', '*.hbs') ],
    // eslint-disable-next-line no-template-curly-in-string
    remoteStatusParams: [
      (resource, metaByFile) => {
        const dir = path.join('experience', `${resource.viewType}s`);
        const unsanitizeFilename = path.join(dir, `${resource.name}.hbs`);
        if (metaByFile[unsanitizeFilename] && metaByFile[unsanitizeFilename].id === resource.id) {
          // if the unsanitized version of the file already exists just keep it.
          return unsanitizeFilename;
        }
        const filename = sanitizeFilename(resource.name);
        if (!filename) {
          // log a warning here..
          return path.join(dir, `${resource.id}.hbs`);
        }
        const totalPath = path.join(dir, `${filename}.hbs`);
        if (!metaByFile[totalPath] || metaByFile[totalPath].id === resource.id) {
          return totalPath;
        } else {
          const allFiles = Object.keys(metaByFile);
          const basicFilename = path.join(dir, `${filename}`);
          let count = 0;
          allFiles.forEach((localfileaname) => {
            if (startsWith(basicFilename, localfileaname)) {
              count++;
            }
          });
          return `${basicFilename}-${count - 1}.hbs`;
        }
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
