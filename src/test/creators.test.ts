
import {
  draw, drawAsync, drawEither,
  drawFailableAsync, drawFailableFunction, drawFunction,
  drawNullable,
  reject
} from '../arrow/creators'
import {
  Arrow, resolve
} from '../arrow/index'
import { Right } from '../either'

it('Arrow should Arrow', async () => {
  const result = await Arrow<{}, never, number>(async () => Right(1))
    .runAsPromiseResult({})
  expect(result).toEqual(1)
})

it('Arrow should drawAsync', async () => {
  const result = await drawAsync<number>(async () => 1)
    .runAsPromiseResult({})
  expect(result).toEqual(1)
})

it('Arrow should drawFunction', async () => {
  const result = await drawFunction<number>(() => 1)
    .runAsPromiseResult({})
  expect(result).toEqual(1)
})

it('Arrow should drawEither - right', async () => {
  const result = await drawEither<never, number>(Right(1))
    .runAsPromiseResult({})
  expect(result).toEqual(1)
})

it('Arrow should drawEither - left', async () => {
  const result = await drawEither<never, number>(Right(1))
    .runAsPromiseResult({})
  expect(result).toEqual(1)
})

it('Arrow should drawFailableAsync - success', async () => {
  const result = await drawFailableAsync<number>(async () => 1)
    .runAsPromiseResult({})
  expect(result).toEqual(1)
})

it('Arrow should drawFailableAsync - failure', async () => {
  const result = await drawFailableAsync<number>(async () => 1)
    .runAsPromiseResult({})
  expect(result).toEqual(1)
})

it('Arrow should drawFailableFunction - success', async () => {
  const result = await drawFailableFunction<number>(() => 1)
    .runAsPromiseResult({})
  expect(result).toEqual(1)
})

it('Arrow should drawFailableFunction - failure', async () => {
  const { result, error } = await drawFailableFunction<number>(() => { throw new Error('boom') })
    .leftMap((e) => e.message)
    .runAsPromise({})
  expect(result).toEqual(undefined)
  expect(error).toEqual('boom')
})

it('Arrow should drawNullable - null', async () => {
  const { result, error } = await drawNullable<number>(null)
    .map((a:number) => a + 1)
    .leftMap((a) => 'its null')
    .runAsPromise({})
  expect(result).toEqual(undefined)
  expect(error).toEqual('its null')
})

it('Arrow should drawNullable - non null', async () => {
  const { result, error } = await drawNullable(1)
    .map((a) => a + 1)
    .leftMap((a) => 'its null')
    .runAsPromise({})
  expect(result).toEqual(2)
  expect(error).toEqual(undefined)
})

it('Arrow should resolve', async () => {
  const { result, error } = await resolve(1)
    .map((a) => a + 1)
    .runAsPromise({})
  expect(error).toEqual(undefined)
  expect(result).toEqual(2)
})

it('Arrow should fail', async () => {
  const { result, error } = await reject(1)
    .map((a) => a + 1)
    .runAsPromise({})
  expect(error).toEqual(1)
  expect(result).toEqual(undefined)
})

it('Arrow should draw from dependencies', async () => {
  const client = {
    send: (name: string) => resolve('success')
  }

  type Client = typeof client

  const sendViaClient = (name: string) => draw((client: Client) => client.send(name))
  const result = await sendViaClient('jj')
    .runAsPromiseResult(client)
  expect(result).toEqual('success')
})