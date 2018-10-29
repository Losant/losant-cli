#!/usr/bin/env node
require('../lib/on-death');
require('../commands/configure').parse(process.argv);

