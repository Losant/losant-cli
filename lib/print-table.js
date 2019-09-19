// TODO move into logger
const Table = require('cli-table3');
const { log } = require('./logger');
const c = require('chalk');

module.exports = (headers, columns) => {
  headers = headers.map((name) => { return c.magentaBright(name); });

  const table = new Table({ head: headers, wordWrap: true });

  table.push(...columns);

  return log(table.toString());
};
