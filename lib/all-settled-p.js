const onSettledSuccess = (value) => { return { state: 'fulfilled', value }; };
const onSettledReject = (reason) => { return { state: 'rejected', reason }; };
const oneSettledP = (promise) => { return promise.then(onSettledSuccess, onSettledReject); };
module.exports = (promises) => { return Promise.all(promises.map(oneSettledP)); };
