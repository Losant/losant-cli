const c = require('chalk');
module.exports = (program) => {
  // program.showHelpAfterError();
  return program.action(function(...args) {
    let cmd = args.pop();
    console.log(cmd);
    console.error(`${c.redBright('Unknown command')}: ${args.join(' ')}\n`);
    this.help();
  });
};
