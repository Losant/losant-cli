const Rollbar    = require('rollbar');
const { isNil, objOf, compose, reject, unless } = require('omnibelt');
const pkg = require('../package.json');
const rollbarKey = process.env.ROLLBAR_KEY || 'b98132768c5549678bb6496bd904741e';

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
    verbose: false,
    payload: {
      version: pkg.version
    } // if you have a key no need to be verbose.
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
  if (process.env.NODE_ENV !== 'test') {
    custom = unless(isNil, objOf('custom'))(custom);
    const args = compose(reject(isNil))([message, error, custom]);
    return rollbar.error(...args);
  }
};

module.exports = { rollbar, rollbarLog };
