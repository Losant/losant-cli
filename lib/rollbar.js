const Rollbar    = require('rollbar');
const { isNil, objOf, compose, reject, unless } = require('omnibelt');
const rollbarKey = process.env.ROLLBAR_KEY;

// prevent rollbar from printing its own messages to console
const rollbarLogger = require('rollbar/src/server/logger');
rollbarLogger.log = () => {};
rollbarLogger.error = () => {};

let rollbar;
if (rollbarKey) {
  rollbar = new Rollbar({
    itemsPerMinute: 5,
    accessToken: rollbarKey,
    captureUncaught: false,
    captureUnhandledRejections: false,
    exitOnUncaughtException: false,
    enabled: true,
    verbose: false // if you have a key no need to be verbose.
  });
} else {
  rollbar = new Rollbar({
    accessToken: '',
    captureUncaught: false,
    captureUnhandledRejections: false,
    exitOnUncaughtException: false,
    enabled: false,
    verbose: true
  });
}

const rollbarLog = ({ message, error, custom }) => {
  custom = unless(isNil, objOf('custom'))(custom);
  const args = compose(reject(isNil))([message, error, custom]);
  return rollbar.error(...args);
};

module.exports = { rollbar, rollbarLog };
