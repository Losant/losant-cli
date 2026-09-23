#!/usr/bin/env node
import '../lib/node-env.js';
import '../lib/on-death.js';
import program from '../commands/files/index.js';

program.parse(process.argv);
