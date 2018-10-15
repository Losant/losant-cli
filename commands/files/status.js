const { constants: { files: { COMMAND_TYPE, API_TYPE, LOCAL_STATUS_PARAMS, REMOTE_STATUS_PARAMS } } } = require('../../lib');
const params = {
  apiType: API_TYPE,
  commandType: COMMAND_TYPE,
  localStatusParams: LOCAL_STATUS_PARAMS,
  remoteStatusParams: REMOTE_STATUS_PARAMS,
  filterFunc: (item) => { return item.type === 'file'; }
};

module.exports = (program) => {
  require('../utils/status')(program, params);
};
