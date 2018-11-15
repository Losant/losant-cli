const ON_DEATH = require('death'); //this is intentionally ugly
const { noop } = require('omnibelt');
const { log, logError } = require('./utils');
const { rollbar } = require('./rollbar');
const die = ON_DEATH(function(signal, err) {
  log(`Unexpected shut down with signal ${signal}`);
  if (err) {
    logError(err);
    rollbar._uncaughtError(err, noop);
  }
  // this is for the locker if the process ends with a signal of 1, it will automagically unlock everything
  // this will get fired on SIGINT, SIGQUIT, SIGETERM
  setImmediate(() => {
    rollbar.wait(() => {
      process.exit(1);
    });
  });
});

module.exports = die;
