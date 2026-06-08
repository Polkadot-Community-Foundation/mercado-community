/** Sentinel symbol to identify timeout results */
export const TIMEOUT_SYMBOL = Symbol('timeout');

export type TimeoutResult<T> = T | typeof TIMEOUT_SYMBOL;

/** Check if a result is a timeout */
export function isTimeout<T>(
  result: TimeoutResult<T>,
): result is typeof TIMEOUT_SYMBOL {
  return result === TIMEOUT_SYMBOL;
}

/**
 * Timeout wrapper - resolves to TIMEOUT_SYMBOL if promise exceeds ms.
 * Properly cleans up the timer when the main promise wins.
 * Use isTimeout() to check if the result was a timeout.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<TimeoutResult<T>> {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<typeof TIMEOUT_SYMBOL>((resolve) => {
    timerId = setTimeout(() => resolve(TIMEOUT_SYMBOL), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  });
}
