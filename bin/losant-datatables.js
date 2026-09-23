#!/usr/bin/env node
import '../lib/node-env.js';
import '../lib/on-death.js';
import program from '../commands/dataTables/index.js';

program.parse(process.argv);
