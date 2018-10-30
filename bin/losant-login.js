#!/usr/bin/env node
require('../lib/on-death');
require('../commands/login').parse(process.argv);
