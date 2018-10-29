const retryP = async (funcToRetry, stopRetryFunc, isRetry = false) => {
  let result;
  try {
    result = await funcToRetry(isRetry);
  } catch (e) {
    if (!(await stopRetryFunc(e))) {
      return retryP(funcToRetry, stopRetryFunc, true);
    }
    throw e;
  }
  return result;
};
module.exports = retryP;
