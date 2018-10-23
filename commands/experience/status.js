const { experience } = require('../../lib/constants');
module.exports = (program) => {
  require('../utils/status')(program, 'experience', experience);
};
