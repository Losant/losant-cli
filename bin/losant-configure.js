#!/usr/bin/env node --harmony
require('../lib/on-death');
require('../commands/configure').parse(process.argv);

