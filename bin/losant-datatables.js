#!/usr/bin/env node
require('../lib/on-death');
require('../commands/dataTables').parse(process.argv);
