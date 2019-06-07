const { dataTables } = require('../../lib/constants');

module.exports = (program) => {
  return require('../utils/status')(program, 'dataTables', dataTables);
};
