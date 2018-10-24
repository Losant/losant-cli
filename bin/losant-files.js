#!/usr/bin/env node --harmony
require('../lib/on-death');
require('../commands/files').parse(process.argv);
