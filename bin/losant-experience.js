#!/usr/bin/env node
require('../lib/on-death');
require('../commands/experience').parse(process.argv);
