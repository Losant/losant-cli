import { Command } from 'commander';
import bootstrap from './bootstrap.js';
import download from './download.js';
import layout from './layout.js';
import status from './status.js';
import upload from './upload.js';
import version from './version.js';
import * as common from '../common/index.js';

const commands = [bootstrap, download, layout, status, upload, version];
const program = new Command('losant experience'); //.storeOptionsAsProperties();

program.description('Manages your Losant Application\'s Experience Views, and Versions from the command line.');
program.showHelpAfterError();

commands.forEach((command) => {
  return command(program) || {};
});

Object.values(common).forEach((command) => {
  return command('experience', program) || {};
});

export default program;
