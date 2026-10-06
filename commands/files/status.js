import constants from '../../lib/constants.js';
import status from '../utils/status.js';

const { files: { apiType, commandType, localStatusParams, remoteStatusParams } } = constants;
const params = {
  apiType,
  commandType,
  localStatusParams,
  remoteStatusParams,
  getQuery: { type: 'file' }
};

export default (program) => {
  return status(program, 'files', params);
};
