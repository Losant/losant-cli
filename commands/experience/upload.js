const { experience: params } = require('../../lib/get-upload-params');

module.exports = (program) => {
  require('../utils/upload')(program, params);
  return {
    helpLines: [
      'Upload all experience views',
      '$ losant experience upload',
      'Upload component view',
      '$ losant experience upload components/*'
    ]
  };
};
