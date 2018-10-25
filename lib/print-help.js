const { log } = require('./utils');
const { startsWith } = require('omnibelt');

module.exports = (program, help) => {
  if (help.length) {
    program.on('--help', () => {
      log('');
      log('   Examples:');
      log('');
      help.forEach((line) => {
        if (startsWith('$', line)) {
          line = `      ${line}`;
        } else {
          line = `    ${line}`;
        }
        log(line);
      });
      log('');
    });
  }
};
