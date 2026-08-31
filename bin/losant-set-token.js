#!/usr/bin/env node
import '../lib/on-death.js';
import program from '../commands/set-token/index.js';

program.parse(process.argv);
