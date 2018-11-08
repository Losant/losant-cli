const evaluator = async (func, iterator) => {
  const next = iterator.next();
  if (next.done) { return; }
  await func(next.value);
  return evaluator(func, iterator);
};

module.exports = (func, ary) => {
  if (!ary[Symbol.iterator]) { throw new Error(`${ary} is not iterable!`); }
  return evaluator(func, ary[Symbol.iterator]());
};
