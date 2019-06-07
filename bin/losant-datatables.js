#!/usr/bin/env node
require('../lib/on-death');
const unknownCommandWrap = require('../lib/unknown-command-listener');
unknownCommandWrap(require('../commands/dataTables')).parse(process.argv);
