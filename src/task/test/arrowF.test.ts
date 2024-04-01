import { Task } from '../index'
import { left, right } from '../../either'

it('Task should flatMapF', async () => {
  const result = await Task<never, number>(async () => right(1))
    .flatMapF((a) => async () => right(a * 3))
    .runAsPromiseResult()
  expect(result).toEqual(3)
})

it('Task should flatMapF - dependency', async () => {
  const result = await Task<never, number>(async () => right(1))
    .flatMapF((a) => async () => right(a * 3))
    .runAsPromiseResult()
  expect(result).toEqual(3)
})

it('Task should flatMapF - fail', async () => {
  const { tag, value } = await Task<number, never>(async () => left(1))
    .flatMapF((a) => async () => right(a * 3))
    .runAsPromise()
  expect(tag).toEqual('error')
  expect(value).toEqual(1)
})

it('Task should groupF', async () => {
  const result = await Task<never, number>(async () => right(1))
    .groupF(async () => right(2))
    .runAsPromiseResult()
  expect(result).toEqual([1, 2])
})

it('Task should groupF - fail', async () => {
  const { tag, value } = await Task<never, number>(async () => right(1))
    .groupF(async () => left(2))
    .runAsPromise()
  expect(tag).toEqual('error')
  expect(value).toEqual(2)
})

it('Task should group firstF', async () => {
  const result = await Task<never, number>(async () => right(1))
    .groupFirstF(async () => right(2))
    .runAsPromiseResult()
  expect(result).toEqual(1)
})

it('Task should group secondF', async () => {
  const result = await Task<never, number>(async () => right(1))
    .groupSecondF(async () => right(2))
    .runAsPromiseResult()
  expect(result).toEqual(2)
})

it('Task should orElseF', async () => {
  const result = await Task<number, never>(async () => left(1))
    .orElseF(async () => right(2))
    .runAsPromiseResult()
  expect(result).toEqual(2)
})

it('Task should orElseF', async () => {
  const a = Task<number, never>(async () => left(1)).orElseF(async () => left(2))

  const result = await a.orElseF(async () => right(2)).runAsPromiseResult()
  expect(result).toEqual(2)
})
