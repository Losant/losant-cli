#!/usr/bin/env node
import '../lib/node-env.js';
import '../lib/on-death.js';
import program from '../commands/login/index.js';

program.parse(process.argv);
