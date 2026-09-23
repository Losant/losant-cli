import Table from 'cli-table3';
import utils from './utils.js';
import c from 'chalk';

const { log } = utils;

export default (headers, columns) => {
  headers = headers.map((name) => { return c.magentaBright(name); });

  const table = new Table({ head: headers, wordWrap: true });

  table.push(...columns);

  return log(table.toString());
};
