const { spawn }    = require('child_process');
const { logError } = require('./utils');
const fs           = require('fs');
module.exports = (command) => {
  if (command.dir) {
    process.chdir(command.dir);
  }
  fs.watch('views', { recursive: true }, (eventType, filename) => {
    if (eventType === 'change') {
      if (filename) {
        const cmd = process.argv[0];
        const args = process.argv.slice(1);
        args[1] = 'upload';
        args.push(`${filename.slice(0, -4)}`);
        const options = {
          cwd: process.cwd(),
          stdio: [process.stdin, process.stdout, 'pipe']
        };
        const upload = spawn(cmd, args, options);
        upload.on('error', (err) => {
          logError(err);
          process.exit(1);
        });
      }
    }
  });
};
