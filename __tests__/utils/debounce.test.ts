/**
 * @jest-environment jsdom
 */
import { debounce, debounceCancellable, throttle } from '@/utils/debounce'

describe('debounce', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should delay function execution', () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('arg1', 'arg2')
    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should reset timer on subsequent calls', () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('first')
    jest.advanceTimersByTime(50)
    
    debouncedFn('second')
    jest.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledWith('second')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should preserve function context and arguments', () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 50)

    debouncedFn(1, 2, 3)
    jest.advanceTimersByTime(50)

    expect(fn).toHaveBeenCalledWith(1, 2, 3)
  })
})

describe('debounceCancellable', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should provide cancel functionality', () => {
    const fn = jest.fn()
    const { debounced, cancel } = debounceCancellable(fn, 100)

    debounced('test')
    expect(fn).not.toHaveBeenCalled()

    cancel()
    jest.advanceTimersByTime(100)
    expect(fn).not.toHaveBeenCalled()
  })

  it('should provide flush functionality', () => {
    const fn = jest.fn()
    const { debounced, flush } = debounceCancellable(fn, 100)

    debounced('test')
    flush('immediate')

    expect(fn).toHaveBeenCalledWith('immediate')
    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should report pending state correctly', () => {
    const fn = jest.fn()
    const { debounced, pending, cancel } = debounceCancellable(fn, 100)

    expect(pending()).toBe(false)

    debounced('test')
    expect(pending()).toBe(true)

    cancel()
    expect(pending()).toBe(false)
  })

  it('should clear pending state after execution', () => {
    const fn = jest.fn()
    const { debounced, pending } = debounceCancellable(fn, 100)

    debounced('test')
    expect(pending()).toBe(true)

    jest.advanceTimersByTime(100)
    expect(pending()).toBe(false)
    expect(fn).toHaveBeenCalled()
  })
})

describe('throttle', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should limit function calls to specified interval', () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn('first')
    expect(fn).toHaveBeenCalledWith('first')

    throttledFn('second')
    expect(fn).toHaveBeenCalledTimes(1) // Should not call immediately

    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('second')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should execute immediately on first call', () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn('immediate')
    expect(fn).toHaveBeenCalledWith('immediate')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should schedule trailing execution', () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn('first')
    jest.advanceTimersByTime(50)
    throttledFn('second')
    jest.advanceTimersByTime(25)
    throttledFn('third')

    expect(fn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(50) // Complete the throttle interval
    expect(fn).toHaveBeenCalledWith('third')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should handle rapid successive calls correctly', () => {
    const fn = jest.fn()
    const throttledFn = throttle(fn, 100)

    // Rapid calls
    throttledFn('1')
    throttledFn('2')
    throttledFn('3')
    throttledFn('4')
    throttledFn('5')

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('1')

    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('5') // Last argument used
    expect(fn).toHaveBeenCalledTimes(2)
  })
})