const Rollbar = require('rollbar');
const {
  isNil, isNotNil, objOf, compose, reject, unless
} = require('omnibelt');
const pkg = require('../package.json');
const rollbarKey = isNotNil(process.env.ROLLBAR_KEY) ? process.env.ROLLBAR_KEY : '388f6eeb25624f7e8627bb92c69a1a47';

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
    logLevel: 'disable', // prevent rollbar from printing its own messages to console
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
    verbose: true,
    logLevel: 'disable'
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
