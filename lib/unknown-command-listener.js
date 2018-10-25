const c = require('chalk');
module.exports = (program) => {
  return program.action(function(...args) {
    args.pop();
    console.error(`${c.redBright('Unknown command')}: ${args.join(' ')}\n`);
    this.help();
  });
};
