#!/usr/bin/env node
import '../lib/on-death.js';
import program from '../commands/experience/index.js';

program.parse(process.argv);
