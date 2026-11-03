import inquirer from 'inquirer';
import fsExtra from 'fs-extra';
import path from 'path';

const { readdirSync, readFileSync } = fsExtra;
const root = path.resolve(import.meta.dirname, '../..');

const sourceFiles = ['commands', 'lib'].flatMap((dir) => {
  return readdirSync(path.join(root, dir), { recursive: true })
    .filter((file) => { return file.endsWith('.js'); })
    .map((file) => { return path.join(dir, file); });
});

// The specs stub inquirer.prompt, so an unregistered prompt type (e.g. 'list', removed in
// inquirer v14) never reaches the real prompt runner and goes unnoticed until runtime.
describe('inquirer prompt types', () => {
  it('should only use prompt types registered with inquirer', () => {
    const registered = Object.keys(inquirer.prompt.prompts);
    const used = [];
    sourceFiles.forEach((file) => {
      const source = readFileSync(path.join(root, file), 'utf8');
      for (const [, questions] of source.matchAll(/inquirer\.prompt\(\[([\s\S]*?)\]\)/g)) {
        for (const [, type] of questions.matchAll(/\btype: '(\w+)'/g)) {
          used.push({ file, type });
        }
      }
    });
    used.length.should.be.above(0);
    used.filter(({ type }) => { return !registered.includes(type); }).should.deepEqual([]);
  });
});
