// static imports are hoisted and evaluated before the importing module's body,
// so this default has to live in a module that is imported first rather than as
// a plain statement in the entrypoint. lib/on-death.js and lib/rollbar.js both
// branch on NODE_ENV, and on-death.js does so while it is being evaluated.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
