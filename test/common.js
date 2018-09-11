const { promisify } = require('util');
const rimraf = require('rimraf');
const rmDir = promisify(rimraf);

module.exports = {
  rmDir
};
