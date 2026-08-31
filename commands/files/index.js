import { Command } from 'commander';
import download from './download.js';
import status from './status.js';
import upload from './upload.js';
import * as common from '../common/index.js';

const commands = [download, status, upload];
const program = new Command('losant files');
program.description('Manage Files on Losant for your Application.');
program.showHelpAfterError();
commands.forEach((command) => {
  command(program);
});
Object.values(common).forEach((command) => {
  command('files', program);
});

export default program;
