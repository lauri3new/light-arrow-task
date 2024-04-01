/* eslint-disable no-await-in-loop */
import { Runner } from './runner'

export const worker = async (iterator: IterableIterator<[number, Runner]>) => {
  const out = []
  for (const [index, runner] of iterator) {
    const {
      tag, value
    } = await runner.run()
    if (tag === 'error' || tag === 'failure') {
      // eslint-disable-next-line no-throw-literal
      throw {
        tag,
        value
      }
    }
    out.push(value)
  }
  return out
}
