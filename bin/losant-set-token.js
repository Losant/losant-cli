#!/usr/bin/env node
require('../lib/on-death');
require('../commands/set-token').parse(process.argv);
