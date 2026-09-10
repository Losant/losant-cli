#!/usr/bin/env node
import '../lib/on-death.js';
import program from '../commands/files/index.js';

program.parse(process.argv);
