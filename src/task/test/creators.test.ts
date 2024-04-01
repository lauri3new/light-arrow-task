import {
  convertAsync, fromEither, fromNullable, reject, task
} from '../creators'
import { Task, resolve } from '../index'
import { right } from '../../either'

it('Task should Task', async () => {
  const result = await Task<never, number>(async () => right(1)).runAsPromiseResult()
  expect(result).toEqual(1)
})

it('Task should fromEither - right', async () => {
  const result = await fromEither<never, number>(right(1)).runAsPromiseResult()
  expect(result).toEqual(1)
})

it('Task should fromEither - left', async () => {
  const result = await fromEither<never, number>(right(1)).runAsPromiseResult()
  expect(result).toEqual(1)
})

it('Task should fromNullable - null', async () => {
  const { tag, value } = await fromNullable<number>(null)
    .map((a: number) => a + 1)
    .leftMap((a) => 'its null')
    .runAsPromise()
  expect(tag).toEqual('error')
  expect(value).toEqual('its null')
})

it('Task should fromNullable - non null', async () => {
  const { tag, value } = await fromNullable(1)
    .map((a) => a + 1)
    .leftMap((a) => 'its null')
    .runAsPromise()
  expect(value).toEqual(2)
  expect(tag).toEqual('result')
})

it('Task should resolve', async () => {
  const { tag, value } = await resolve(1)
    .map((a) => a + 1)
    .runAsPromise()
  expect(value).toEqual(2)
  expect(tag).toEqual('result')
})

it('Task should fail', async () => {
  const { tag, value } = await reject(1)
    .map((a) => a + 1)
    .runAsPromise()
  expect(value).toEqual(1)
  expect(tag).toEqual('error')
})

it('convertAsync should convert async', async () => {
  const myAsync = async (a: string) => 5

  const myFuncTask = convertAsync(myAsync)

  const result = await myFuncTask('ok').runAsPromiseResult()
  expect(result).toEqual(5)
})

it('convertAsync should convert async', async () => {
  const myAsync = async (a: string) => {
    throw new Error('doh')
  }

  const myFuncTask = convertAsync(myAsync)

  const result = await myFuncTask('ok').runAsPromise()
  expect(result.tag).toEqual('error')
  expect(result.value).toEqual(new Error('doh'))
})

it('task should create a task right', async () => {
  const myFuncTask = task(({ right }) => Promise.resolve(right(5)))

  const result = await myFuncTask.runAsPromiseResult()
  expect(result).toEqual(5)
})

it('task should create a task left', async () => {
  const myFuncTask = task(({ left }) => Promise.resolve(left(5)))

  const result = await myFuncTask.runAsPromise()
  expect(result.tag).toEqual('error')
  expect(result.value).toEqual(5)
})

it('task should create a task fromNullable', async () => {
  const myFuncTask = task(({ fromNullable }) => Promise.resolve(fromNullable(5)))

  const result = await myFuncTask.runAsPromiseResult()
  expect(result).toEqual(5)
})

it('task should create a task fromNullable null case', async () => {
  const myFuncTask = task(({ fromNullable }) => Promise.resolve(fromNullable(null)))

  const result = await myFuncTask.runAsPromise()

  expect(result.tag).toEqual('error')
  expect(result.value).toEqual(null)
})
