const ON_DEATH = require('death'); //this is intentionally ugly
const { log, logError } = require('./utils');
const die = ON_DEATH(function(signal, err) {
  log(`Unexpected shut down with signal ${signal}`);
  logError(err);
  // this is for the locker if the process ends with a singal of 1, it will automagically unlock everything
  // this will get fired on SIGINT, SIGQUIT, SIGETERM
  process.exit(1);
});

module.exports = die;
