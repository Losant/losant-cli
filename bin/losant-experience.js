#!/usr/bin/env node
const unknownCommandWrap = require('../lib/unknown-command-listener');
require('../lib/on-death');
unknownCommandWrap(require('../commands/experience')).parse(process.argv);

