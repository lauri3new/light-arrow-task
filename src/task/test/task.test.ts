import { reject } from '../creators'
import { Task, resolve } from '../index'
import { left, right } from '../../either'
import { sleep } from './helpers'

it('Task should map', async () => {
  const result = await Task<never, number>(async () => right(1))
    .map((a) => a * 3)
    .runAsPromiseResult()
  expect(result).toEqual(3)
})

it('Task should tap', async () => {
  let i = 0
  const result = await Task<never, number>(async () => right(1))
    .map((a) => a * 3)
    .tap((a) => {
      i = a
    })
    .runAsPromiseResult()
  expect(result).toEqual(3)
  expect(i).toEqual(3)
})

it('Task should be immutable', async () => {
  const a = Task<never, number>(async () => right(1))
  const result = await a.map((a) => a * 2).runAsPromiseResult()
  expect(result).toEqual(2)

  const result1 = await a.map((a) => a * 3).runAsPromiseResult()
  expect(result1).toEqual(3)
})

it('Task should map - fail', async () => {
  const { tag, value } = await Task<never, number>(async () => right(1))
    .flatMap(() => Task<number, never>(async () => left(1)))
    .map((a) => a * 3)
    .runAsPromise()
  expect(tag).toEqual('error')
  expect(value).toEqual(1)
})

it('Task should flatMap', async () => {
  const result = await Task<never, number>(async () => right(1))
    .flatMap((a) => Task<never, number>(async () => right(a * 3)))
    .runAsPromiseResult()
  expect(result).toEqual(3)
})

it('Task should flatMap - fail', async () => {
  const { tag, value } = await Task<number, never>(async () => left(1))
    .flatMap((a) => Task<never, number>(async () => right(a * 3)))
    .runAsPromise()
  expect(tag).toEqual('error')
  expect(value).toEqual(1)
})

it('Task should flatMapIf - true', async () => {
  const condition: boolean = true
  const result = await Task<never, number>(async () => right(1))
    .flatMapIf(condition, (a) => Task<never, number>(async () => right(a * 3)))
    .runAsPromiseResult()
  expect(result).toEqual(3)
})

it('Task should flatMapIf - false', async () => {
  const condition: boolean = false
  const result = await Task<never, number>(async () => right(1))
    .flatMapIf(condition, (a) => Task<never, number>(async () => right(a * 3)))
    .runAsPromiseResult()
  expect(result).toEqual(1)
})

it('Task should leftMap', async () => {
  const { value, tag } = await Task<number, never>(async () => left(1))
    .leftMap((a) => a * 3)
    .runAsPromise()
  expect(tag).toEqual('error')
  expect(value).toEqual(3)
})

it('Task should leftFlatMap', async () => {
  const { value, tag } = await Task<number, never>(async () => left(1))
    .leftFlatMap((a) => resolve(a * 3))
    .runAsPromise()
  expect(tag).toEqual('error')
  expect(value).toEqual(3)
})

it('Task should leftFlatMap - right', async () => {
  const { tag, value } = await Task<never, number>(async () => right(1))
    .leftFlatMap((a) => resolve(a * 3))
    .runAsPromise()
  expect(tag).toEqual('result')
  expect(value).toEqual(1)
})

it('Task should biMap - right', async () => {
  const { tag, value } = await Task<never, number>(async () => right(1))
    .biMap(
      (a) => a * 3,
      (a) => a * 5
    )
    .runAsPromise()
  expect(value).toEqual(5)
  expect(tag).toEqual('result')
})

it('Task should biMap - left', async () => {
  const { tag, value } = await Task<number, never>(async () => left(1))
    .biMap(
      (a) => a * 3,
      (a) => a * 5
    )
    .runAsPromise()
  expect(tag).toEqual('error')
  expect(value).toEqual(3)
})

it('Task should group', async () => {
  const result = await Task<never, number>(async () => right(1))
    .group(Task<never, number>(async () => right(2)))
    .runAsPromiseResult()
  expect(result).toEqual([1, 2])
})

it('Task should group - fail', async () => {
  const { tag, value } = await Task<never, number>(async () => right(1))
    .group(Task<number, never>(async () => left(2)))
    .runAsPromise()
  expect(value).toEqual(2)
  expect(tag).toEqual('error')
})

it('Task should group first', async () => {
  const result = await Task<never, number>(async () => right(1))
    .groupFirst(Task<never, number>(async () => right(2)))
    .runAsPromiseResult()
  expect(result).toEqual(1)
})

it('Task should group second', async () => {
  const result = await Task<never, number>(async () => right(1))
    .groupSecond(Task<never, number>(async () => right(2)))
    .runAsPromiseResult()
  expect(result).toEqual(2)
})

it('Task should group', async () => {
  const result = await Task<never, number>(async () => right(1))
    .group(Task<never, number>(async () => right(2)))
    .runAsPromiseResult()
  expect(result).toEqual([1, 2])
})

it('Task should orElse', async () => {
  const result = await Task<number, never>(async () => left(1))
    .orElse(Task<never, number>(async () => right(2)))
    .runAsPromiseResult()
  expect(result).toEqual(2)
})

it('Task should orElse', async () => {
  const a = Task<number, never>(async () => left(1)).orElse(
    Task<number, never>(async () => left(2))
  )

  const result = await a
    .orElse(Task<never, number>(async () => right(2)))
    .runAsPromiseResult()
  expect(result).toEqual(2)
})

it('Task should ifOrElse', async () => {
  const a = Task<string, never>(async () => left('hey')).ifOrElse(
    (c) => c === 'wasup',
    Task<string, never>(async () => left('yo'))
  )

  const { value } = await a.runAsPromise()
  expect(value).toEqual('hey')
})

it('Task should ifOrElse', async () => {
  const a = Task<string, never>(async () => left('hey')).ifOrElse(
    (c) => c === 'hey',
    Task<string, never>(async () => left('yo'))
  )

  const { value } = await a.runAsPromise()
  expect(value).toEqual('yo')
})

it('Task should bracket', async () => {
  let flag = false
  const a = Task<never, { ok: number }>(async () => right({ ok: 123 })).bracket(
    (b) => {
      expect(flag).toEqual(false)
      flag = true
      return resolve(null)
    }
  )((c) => {
    expect(flag).toEqual(false)
    return resolve<number>(10)
  })
  const { value } = await a.runAsPromise()
  expect(flag).toEqual(true)
  expect(value).toEqual(10)
})

it('Task should bracket - fail case', async () => {
  let flag = false
  const a = Task<never, { ok: number }>(async () => right({ ok: 123 })).bracket(
    (b) => {
      expect(flag).toEqual(false)
      flag = true
      return resolve(null)
    }
  )((c) => {
    expect(flag).toEqual(false)
    return reject(10)
  })
  const { value } = await a.runAsPromise()
  expect(flag).toEqual(true)
  expect(value).toEqual(10)
})

it('Task should run - success', (cb: () => void) => {
  const a = Task<never, number>(async () => right(5))
  const result = a.run(
    (result) => {
      expect(result).toEqual(5)
      cb()
    },
    (error) => {},
    (failure) => {}
  )
})

it('Task should run - error', (cb: () => void) => {
  const a = Task<number, never>(async () => left(5))

  const result = a.run(
    (result) => {},
    (error) => {
      expect(error).toEqual(5)
      cb()
    },
    (failure) => {}
  )
})

it('Task should run - failure', (cb: () => void) => {
  const a = Task<number, never>(async () => {
    throw new Error('boom')
  })
  const result = a.run(
    (result) => {},
    (error) => {},
    (failure) => {
      expect((failure as any)?.message).toEqual('boom')
      cb()
    }
  )
})

it('Task should run no cancel', (cb: () => void) => {
  let res = 0
  const a = Task<never, number>(async () => {
    await sleep(100)
    return right(5)
  })
  const cancel = a.run(
    (result) => {
      res = result
      expect(result).toEqual(5)
      cb()
    },
    (error) => {}
  )
})

it('Task should run and cancel', async () => {
  let res = 0
  const a = Task<never, number>(async () => {
    await sleep(100)
    res = 2
    return right(5)
  })
  const cancel = await a.run(
    (result) => {
      res = result
    },
    (error) => {}
  )
  cancel()
  await sleep(200)
  expect(res).toEqual(0)
})

it('Task should run as promise result - success', async () => {
  const a = Task<never, number>(async () => right(5))
  const result = await a.runAsPromiseResult()
  expect(result).toEqual(5)
})

it('Task should preserve basic type dep', async () => {
  const result = await Task<never, number>(async () => right(1))
    .map((a) => a * 3)
    .flatMap(() => Task<never, string>(async () => right('hey')))
    .runAsPromiseResult()
  expect(result).toEqual('hey')
})
