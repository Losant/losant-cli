#!/usr/bin/env node
import '../lib/on-death.js';
import program from '../commands/login/index.js';

program.parse(process.argv);
