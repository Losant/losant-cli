#!/usr/bin/env node
require('../lib/on-death');
require('../commands/files').parse(process.argv);
