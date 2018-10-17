const minimatch = require('minimatch');
const { curry } = require('omnibelt');
const { experience: { apiType, commandType, localStatusParams, remoteStatusParams } } = require('../../lib/constants');
const getData = async (view) => {
  return view.body;
};

const curriedFilterFunc = curry((pattern, view) => {
  return minimatch(view.name, pattern);
});


module.exports = (program) => {
  require('../utils/download')(program, {
    getData, curriedFilterFunc, apiType, commandType, localStatusParams, remoteStatusParams
  });
};
