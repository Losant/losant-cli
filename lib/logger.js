const ssLog = require('single-line-log');

const log = (message, newline = true) => {
  ssLog.stdout(message);
  if (newline && process.env.NODE_ENV !== 'test') { console.log(); } // eslint-disable-line no-console
};

const logProcessing = (message, newline = true) => {
  log(`${pad(c.gray('processing'), 13)}\t${message}`, newline);
};

const logResult = (label, message, color, newline = true) => {
  const colorLabel = c[color] ? c[color] : c.gray; // if they do not put in a valid color it can explodes
  let str = `${pad(colorLabel(label), 13)}`;
  if (message) { str += `\t${message}`; }
  log(str, newline);
};

const logError = (err, newline = true) => {
  // err can be either an error object or a string
  log(`${c.redBright('Error')} ${err && err.message ? err.message : err}`, newline);
};

module.exports = {
  log,
  logProcessing,
  logError,
  logResult
};
