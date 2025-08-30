/**
 * Debounce utility for performance optimization
 * 
 * Creates a debounced function that delays execution until after 
 * the specified delay has elapsed since the last time it was invoked.
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    // Clear the previous timeout if it exists
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Creates a debounced function that can be cancelled
 */
export function debounceCancellable<T extends (...args: any[]) => any>(
  func: T,
  delay: number
) {
  let timeoutId: NodeJS.Timeout | null = null

  const debouncedFunction = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const flush = (...args: Parameters<T>) => {
    cancel()
    func(...args)
  }

  return {
    debounced: debouncedFunction,
    cancel,
    flush,
    pending: () => timeoutId !== null,
  }
}

/**
 * Throttle utility - ensures function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0
  let timeoutId: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null

  return (...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime
    lastArgs = args

    if (timeSinceLastCall >= interval) {
      lastCallTime = now
      func(...args)
    } else {
      // Schedule the function to be called at the end of the interval with latest args
      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now()
          func(...(lastArgs as Parameters<T>))
          timeoutId = null
        }, interval - timeSinceLastCall)
      }
    }
  }
}