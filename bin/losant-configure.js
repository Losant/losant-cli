#!/usr/bin/env node
require('../lib/on-death');
const unknownCommandWrap = require('../lib/unknown-command-listener');
unknownCommandWrap(require('../commands/configure')).parse(process.argv);

