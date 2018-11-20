const onSettledSuccess = (value) => { return { state: 'fulfilled', value }; };
const onSettledReject = (reason) => { return { state: 'rejected', reason }; };
const oneSettledP = (promise) => { return promise.then(onSettledSuccess, onSettledReject); };

const evaluator = async (func, accumulator, iterator) => {
  const next = iterator.next();
  if (next.done) { return; }
  accumulator.push(await oneSettledP(func(next.value)));
  await evaluator(func, accumulator, iterator);
};

const serialMapP = async (func, ary) => {
  if (!ary[Symbol.iterator]) { throw new Error(`${ary} is not iterable!`); }
  const iterator = ary[Symbol.iterator]();
  const accumulator = [];
  await evaluator(func, accumulator, iterator);
  return accumulator;
};

module.exports = (pFunc, values) => { return serialMapP(pFunc, values); };
