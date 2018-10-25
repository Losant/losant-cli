#!/usr/bin/env node --harmony
require('../lib/on-death');
const unknownCommandWrap = require('../lib/unknown-command-listener');
unknownCommandWrap(require('../commands/configure')).parse(process.argv);

