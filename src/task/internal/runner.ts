/* eslint-disable no-await-in-loop, no-loop-func, no-unused-expressions */
import { Operation, Ops, Runnable } from './operations'
import { runAsPromiseResult } from './runAsPromiseResult'
import { Stack } from './stack'
import { worker } from './worker'

export function runner(operations: Stack<Operation>) {
  const stack = operations.toArray()
  let cancellables: any[] = []
  let cancelled = false
  let result: any
  let x: any
  let isLeft: boolean = false
  let error: any

  const matchError = (e: any) => {
    isLeft = true
    error = e
  }
  const matchResult = (r: any) => {
    result = r
  }
  const resetError = () => {
    isLeft = false
    error = undefined
  }
  const matchGroupResult = (r: any) => {
    result = [result, r]
  }

  const noChange = () => {}
  const _run = (op: Runnable) => {
    switch (op._tag) {
      case Ops.promiseBased: {
        return op.f().then((x) => {
          x.fold(matchError, matchResult)
        })
      }
      case Ops.construct: {
        return new Promise<void>((res) => {
          let pending = true
          const resolve = (a: any) => {
            result = a
            pending = false
          }
          const reject = (a: any) => {
            isLeft = true
            error = a
            pending = false
          }
          const cancel = op.f()(resolve, reject)
          const check = () => {
            if (cancelled) {
              pending = false
              cancel && cancel()
            }
            if (!pending) {
              res()
            }
            if (pending) {
              setImmediate(() => {
                check()
              })
            }
          }
          check()
        })
      }
    }
  }

  return {
    cancelled: () => cancelled,
    cancel: () => {
      cancelled = true
    },
    async run() {
      while (stack.length) {
        const op = stack.pop()
        if (this.cancelled() || !op) {
          return {
            tag: 'result' as const,
            value: result
          }
        }
        try {
          if (isLeft) {
            switch (op._tag) {
              case Ops.leftMap: {
                if (isLeft) {
                  error = op.f(error)
                }
                break
              }
              case Ops.leftFlatMap: {
                x = op.f(error)
                x = await op.f(error).runAsPromise()
                error = x.value
                break
              }
              case Ops.orElse: {
                resetError()
                if (typeof op.f === 'function') {
                  x = await op.f()
                  x.fold(matchError, matchResult)
                } else {
                  stack.push(...op.f.__ops.toArray())
                }
                break
              }
              case Ops.ifOrElse: {
                if (op.f[0](error)) {
                  resetError()
                  stack.push(...op.f[1].__ops.toArray())
                }
                break
              }
            }
          } else {
            switch (op._tag) {
              case Ops.construct: {
                await _run(op)
                break
              }
              case Ops.bracket: {
                x = op.f[1](result)
                x = await x.runAsPromise()
                const a = op.f[0](result)
                await a.runAsPromise()
                if (x.tag === 'failure') {
                  throw x.value
                }
                if (x.tag === 'error') {
                  matchError(x.value)
                } else {
                  matchResult(x.value)
                }
                break
              }
              case Ops.all:
                try {
                  if (op.concurrencyLimit) {
                    const limit = op.f.length > op.concurrencyLimit
                      ? op.concurrencyLimit
                      : op.f.length
                    const entries = op.f
                      .map((_f) => {
                        const _runner = runner(_f.__ops)
                        cancellables.push(_runner.cancel)
                        return _runner
                      })
                      .entries()
                    result = await Promise.all(
                      new Array(limit).fill(entries).map(worker)
                    ).then((array) => array.flat())
                  } else {
                    result = await Promise.all(
                      op.f.map(async (_f) => {
                        const a = runner(_f.__ops)
                        cancellables.push(a.cancel)
                        return runAsPromiseResult(a)
                      })
                    )
                    cancellables = []
                  }
                } catch (e: any) {
                  while (cancellables[0]) {
                    cancellables.pop()()
                  }
                  if (e?.tag === 'error') {
                    matchError(e?.value)
                  } else {
                    // eslint-disable-next-line no-throw-literal
                    throw e?.value
                  }
                }
                break
              case Ops.race:
                result = await Promise.race(
                  op.f.map((_f) => _f.runAsPromiseResult())
                )
                break
              case Ops.andThen: {
                if (typeof op.f === 'function') {
                  x = await op.f(result)
                  x.fold(matchError, matchResult)
                } else {
                  x = await op.f.runAsPromise()
                  if (x.tag === 'failure') {
                    throw x.value
                  }
                  if (x.tag === 'error') {
                    matchError(x.value)
                  } else {
                    matchResult(x.value)
                  }
                }
                break
              }
              case Ops.group: {
                if (typeof op.f === 'function') {
                  x = await op.f()
                  x.fold(matchError, matchGroupResult)
                } else {
                  x = await op.f.runAsPromise()
                  if (x.tag === 'failure') {
                    throw x.value
                  }
                  if (x.tag === 'error') {
                    matchError(x.value)
                  } else {
                    matchResult([result, x.value])
                  }
                }
                break
              }
              case Ops.groupFirst: {
                if (typeof op.f === 'function') {
                  x = await op.f()
                  x.fold(matchError, noChange)
                } else {
                  x = await op.f.runAsPromise()
                  if (x.tag === 'failure') {
                    throw x.value
                  }
                  if (x.tag === 'error') {
                    matchError(x.value)
                  }
                }
                break
              }
              case Ops.groupSecond: {
                if (typeof op.f === 'function') {
                  x = await op.f()
                  x.fold(matchError, matchResult)
                } else {
                  stack.push(...op.f.__ops.toArray())
                }
                break
              }
              case Ops.flatMap: {
                x = op.f(result)
                if (typeof x === 'function') {
                  x = await x()
                  x.fold(matchError, matchResult)
                } else {
                  stack.push(...x.__ops.toArray())
                }
                break
              }
              case Ops.map: {
                result = op.f(result)
                break
              }
              case Ops.promiseBased: {
                await _run(op)
                break
              }
              case Ops.value: {
                result = op.f
                break
              }
            }
          }
        } catch (e) {
          if (e) {
            return {
              tag: 'failure' as const,
              value: e
            }
          }
          if (isLeft) {
            return {
              tag: 'error' as const,
              value: error
            }
          }
          return {
            tag: 'result' as const,
            value: result
          }
        }
      }
      if (isLeft) {
        return {
          tag: 'error' as const,
          value: error
        }
      }
      return {
        tag: 'result' as const,
        value: result
      }
    }
  }
}

export type Runner = ReturnType<typeof runner>;
