const { file: { apiType, commandType, localStatusParams, remoteStatusParams } } = require('../../lib/constants');
const params = {
  apiType,
  commandType,
  localStatusParams,
  remoteStatusParams,
  filterFunc: (item) => { return item.type === 'file'; }
};
module.exports = (program) => {
  require('../utils/status')(program, params);
};
