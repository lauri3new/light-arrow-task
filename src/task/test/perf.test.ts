import { performance } from 'perf_hooks'
import {
  all, Task, construct, constructTask, resolve
} from '../index'
import { left, right } from '../../either'

it('should be stack safe - recursion case', () => {
  function a(n: number): Task<never, number> {
    if (n === 1) {
      return resolve(1)
    }
    return resolve({}).flatMap(() => a(n - 1))
  }
  a(100000).runAsPromiseResult()
})

it('should be stack safe - recursion case', async () => {
  function a(n: number): any {
    if (n === 1) {
      return constructTask((res) => res(1))
    }
    return constructTask((res) => res(1)).flatMap(() => a(n - 1))
  }
  await a(100000).runAsPromiseResult()
})

it('map should not stack overflow', async () => {
  let a = construct<never, number>(() => (res) => {
    res(1)
    return () => {}
  })
  for (let i = 0; i < 100000; i += 1) {
    a = a.map((c: number) => c + 1)
  }
  const result = await a.runAsPromiseResult()
  expect(result).toEqual(100001)
})

it('flatMap should not stack overflow', async () => {
  let a = construct<never, number>(() => (res) => {
    res(1)
    return () => {}
  })
  for (let i = 0; i < 100000; i += 1) {
    a = a.flatMap((c: number) => construct<never, number>(() => (res) => {
      res(c + 1)
      return () => {}
    }))
  }
  const result = await a.runAsPromiseResult()
  expect(result).toEqual(100001)
})

it('orElse should not stack overflow', async () => {
  let a: any = Task<number, never>(async () => left(1))
  for (let i = 0; i < 10000; i += 1) {
    if (i === 9999) {
      a = a.orElse(Task<never, number>(async () => right(10001)))
    } else {
      a = a.orElse(Task<number, never>(async () => left(10001)))
    }
  }
  const { value, tag } = await a.runAsPromise({})
  expect(tag).toEqual('result')
  expect(value).toEqual(10001)
})

it('group should not stack overflow', async () => {
  let a: any = Task(async () => right(0))
  for (let i = 0; i < 10000; i += 1) {
    a = a
      .group(Task(async () => right(i)))
      .map(([x, y]: any) => (Array.isArray(x) ? [...x, y] : [x, y]))
  }
  const result = await a.runAsPromiseResult()
  expect(result.length).toEqual(10001)
  expect(result[10000]).toEqual(9999)
})

it('all should not stack overflow', async () => {
  const as = []
  for (let i = 0; i < 10000; i += 1) {
    as.push(Task(async () => right(i)))
  }
  const result = await all(as).runAsPromiseResult()
  expect(result.length).toEqual(10000)
  expect(result[9999]).toEqual(9999)
})

it('all should not stack overflow - concurrency limit', async () => {
  const as = []
  for (let i = 0; i < 10000; i += 1) {
    as.push(Task(async () => right(i)))
  }
  const result = await all(as, 100).runAsPromiseResult()
  expect(result.length).toEqual(10000)
  expect(result[9999]).toEqual(9999)
})

it('should flatMap faster than promises', async () => {
  function ar(n: number): any {
    if (n < 1) return resolve({})
    return resolve({}).flatMap(() => ar(n - 1))
  }
  const p1 = performance.now()
  await ar(1000000).runAsPromise({})
  const p2 = performance.now()
  function p(n: number): any {
    if (n < 1) return Promise.resolve()
    return Promise.resolve().then(() => p(n - 1))
  }
  const p3 = performance.now()
  await p(1000000)
  const p4 = performance.now()
  const promiseRunTime = p4 - p3
  const TaskRunTime = p2 - p1
  expect(TaskRunTime).toBeLessThan(promiseRunTime)
})

it('should map faster than promises', async () => {
  let a = resolve(1)
  for (let i = 0; i < 1000000; i += 1) {
    a = a.map((c: number) => c + 1)
  }
  const p1 = performance.now()
  await a.runAsPromise()
  const p2 = performance.now()
  let b = Promise.resolve(1)
  for (let i = 0; i < 1000000; i += 1) {
    b = b.then((c: number) => c + 1)
  }
  const p3 = performance.now()
  await b
  const p4 = performance.now()
  const promiseRunTime = p4 - p3
  const TaskRunTime = p2 - p1
  expect(TaskRunTime).toBeLessThan(promiseRunTime)
})
