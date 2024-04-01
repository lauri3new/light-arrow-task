import { Runner } from './runner'

export async function runAsPromiseResult(a: Runner) {
  const {
    tag, value
  } = await a.run()
  if (tag === 'error' || tag === 'failure') {
    // eslint-disable-next-line no-throw-literal
    throw {
      tag,
      value
    }
  }
  return value
}
