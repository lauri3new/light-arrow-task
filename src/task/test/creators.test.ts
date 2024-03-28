import {
  convertAsync, fromEither, fromNullable, reject
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
  const { result, error } = await fromNullable<number>(null)
    .map((a: number) => a + 1)
    .leftMap((a) => 'its null')
    .runAsPromise()
  expect(result).toEqual(undefined)
  expect(error).toEqual('its null')
})

it('Task should fromNullable - non null', async () => {
  const { result, error } = await fromNullable(1)
    .map((a) => a + 1)
    .leftMap((a) => 'its null')
    .runAsPromise()
  expect(result).toEqual(2)
  expect(error).toEqual(undefined)
})

it('Task should resolve', async () => {
  const { result, error } = await resolve(1)
    .map((a) => a + 1)
    .runAsPromise()
  expect(error).toEqual(undefined)
  expect(result).toEqual(2)
})

it('Task should fail', async () => {
  const { result, error } = await reject(1)
    .map((a) => a + 1)
    .runAsPromise()
  expect(error).toEqual(1)
  expect(result).toEqual(undefined)
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
  expect(result.hasError).toEqual(true)
  expect(result.error).toEqual(new Error('doh'))
})
