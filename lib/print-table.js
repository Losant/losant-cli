const Table = require('cli-table3');
const { log } = require('./utils');

module.exports = (headers, columns) => {
  const table = new Table({ head: headers, wordWrap: true });

  table.push(...columns);

  return log(table.toString());
};
