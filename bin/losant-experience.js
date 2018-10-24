#!/usr/bin/env node --harmony
require('../lib/on-death');
require('../commands/experience').parse(process.argv);
