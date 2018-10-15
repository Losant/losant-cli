module.exports = (program) => {
  require('../utils/status')(program, 'files', {  filterFunc: (item) => { return item.type === 'file'; } });
};
