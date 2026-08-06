// inquirer v9+ is ESM-only; this bridges it into our CommonJS codebase via
// a cached dynamic import so call sites are unchanged: inquirer.prompt(...).
let cached;
const load = async () => {
  if (!cached) {
    cached = (await import('inquirer')).default;
  }
  return cached;
};

module.exports = {
  prompt: async (...args) => {
    const inquirer = await load();
    return inquirer.prompt(...args);
  }
};
