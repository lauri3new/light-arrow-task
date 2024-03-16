/* eslint-disable no-await-in-loop */
import { Runner } from "./runner";

export const worker = async (iterator: IterableIterator<[number, Runner]>) => {
  const out = [];
  for (const [index, runner] of iterator) {
    const { value, tag } = await runner.run();
    if (tag === "error") {
      // eslint-disable-next-line no-throw-literal
      throw {
        tag: "error",
        value,
      };
    } else if (tag === "failure") {
      // eslint-disable-next-line no-throw-literal
      throw {
        tag: "failure",
        value,
      };
    }
    out.push(value);
  }
  return out;
};
