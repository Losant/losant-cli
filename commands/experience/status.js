import constants from '../../lib/constants.js';
import status from '../utils/status.js';

const { experience } = constants;

export default (program) => {
  return status(program, 'experience', experience);
};
