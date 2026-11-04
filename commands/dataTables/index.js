import { Command } from 'commander';
import exportCommand from './export.js';

const program = new Command('losant datatables');

program.description('Manage Data Tables on Losant for your Application');
program.showHelpAfterError();

exportCommand(program);

export default program;
