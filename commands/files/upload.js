const { files: params } = require('../../lib/get-upload-params');
module.exports = (program) => {
  require('../utils/upload')(program,  params);
  return {
    helpLines: [
      'Upload all files',
      '$ losant files upload',
      'Upload files in images directory',
      '$ losant files upload images/*',
      'Force an upload of all files overwriting remote modifications',
      '$ losant files upload -f'
    ]
  };
};
