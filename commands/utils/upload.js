import getUploader from '../../lib/get-uploader.js';
import constants from '../../lib/constants.js';

const { options } = constants;

export default (program, params, opts) => {
  const subProgram = program
    .command('upload [pattern]')
    .option(...options.force)
    .option(...options.dryRun);

  if (opts && opts.length) {
    opts.forEach((opt) => {
      subProgram.option(...opt);
    });
  }
  return subProgram.action(getUploader(params));
};
