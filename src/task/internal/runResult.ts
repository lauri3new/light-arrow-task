import { Runner } from "./runner";

export async function runResult(a: Runner) {
  const { tag, value } = await a.run();

  if (tag === "error") {
    // eslint-disable-next-line no-throw-literal
    throw {
      tag: "error",
      value: value,
    };
  } else if (tag === "failure") {
    // eslint-disable-next-line no-throw-literal
    throw {
      tag: "failure",
      value: value,
    };
  }
  return value;
}
