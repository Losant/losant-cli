const ON_DEATH = require('death'); //this is intentionally ugly
const { noop } = require('omnibelt');
const { log, logError, unlockConfigSync } = require('./utils');
const { rollbar } = require('./rollbar');
const die = ON_DEATH(function(signal, err) {
  if (signal !== 'SIGINT') {
    log(`Unexpected shut down with signal ${signal}`);
    if (err) {
      logError(err);
      rollbar._uncaughtError(err, noop);
    }
  }
  // this is for the locker if the process ends with a signal of 1, it will automagically unlock everything
  // this will get fired on SIGINT, SIGQUIT, SIGTERM
  setImmediate(() => {
    rollbar.wait(() => {
      process.exit(1);
    });
  });
});

const handleUncaught = (type) => {
  return (error) => {
    log(`Exited on unhandled ${type}: ${error.message}`);
    rollbar._uncaughtError(error, noop);
    setImmediate(() => {
      rollbar.wait(() => {
        process.exit(1);
      });
    });
  };
};

if (process.env.NODE_ENV === 'production') {
  process.on('exit', () => {
    unlockConfigSync();
  });
  process.on('uncaughtException', handleUncaught('exception'));
  process.on('unhandledRejection', handleUncaught('rejection'));
}

module.exports = die;
