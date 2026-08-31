import getDownloader from '../../lib/get-downloader.js';
import constants from '../../lib/constants.js';

const { options } = constants;

export default (program, params = {}, opts) => {
  const subProgram = program
    .command('download [pattern]')
    .option(...options.force)
    .option(...options.dryRun);

  if (opts && opts.length) {
    opts.forEach((opt) => {
      subProgram.option(...opt);
    });
  }
  return subProgram.action(getDownloader(params));
};
