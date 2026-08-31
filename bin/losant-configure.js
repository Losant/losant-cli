#!/usr/bin/env node
import '../lib/on-death.js';
import program from '../commands/configure/index.js';

program.parse(process.argv);
