const { getExporter } = require('../../lib');
const { options } = require('../../lib/constants');

module.exports = (program, params = {}, opts) => {
  const subProgram = program
    .command('export [pattern]')
    .option(...options.force)
    .option(...options.dryRun);

  if (opts && opts.length) {
    opts.forEach((opt) => {
      subProgram.option(...opt);
    });
  }
  return subProgram.action(getExporter(params));
};
