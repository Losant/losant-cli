#!/usr/bin/env node
require('../lib/on-death');
require('../commands/sign-in').parse(process.argv);
