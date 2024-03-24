import {
  convertAsync,
  fromEither,
  fromNullable,
  reject,
  task,
} from "../creators";
import { Task, resolve } from "../index";
import { Left, Right } from "../../either";

it("task should Task", async () => {
  const result = await task(async ({ right }) => right(1)).run();
  expect(result.value).toEqual(1);
  expect(result.tag).toEqual("success");
});

it("task should Task - left", async () => {
  const result = await task(async ({ left }) => left(1)).run();
  expect(result.value).toEqual(1);
  expect(result.tag).toEqual("error");
});

it("Task should Task - right", async () => {
  const result = await Task<never, number>(async () => Right(1)).runResult();
  expect(result).toEqual(1);
});

it("Task should fromEither - right", async () => {
  const result = await fromEither<never, number>(Right(1)).runResult();
  expect(result).toEqual(1);
});

it("Task should fromEither - left", async () => {
  const result = await fromEither<never, number>(Right(1)).runResult();
  expect(result).toEqual(1);
});

it("Task should fromNullable - null", async () => {
  const { tag, value } = await fromNullable<number>(null)
    .map((a: number) => a + 1)
    .leftMap((a) => "its null")
    .run();
  expect(tag).toEqual("error");
  expect(value).toEqual("its null");
});

it("Task should fromNullable - non null", async () => {
  const { tag, value } = await fromNullable(1)
    .map((a) => a + 1)
    .leftMap((a) => "its null")
    .run();
  expect(value).toEqual(2);
  expect(tag).toEqual("success");
});

it("Task should resolve", async () => {
  const { tag, value } = await resolve(1)
    .map((a) => a + 1)
    .run();
  expect(tag).toEqual("success");
  expect(value).toEqual(2);
});

it("Task should fail", async () => {
  const { tag, value } = await reject(1)
    .map((a) => a + 1)
    .run();
  expect(value).toEqual(1);
  expect(tag).toEqual("error");
});

it("convertAsync should convert async", async () => {
  const myAsync = async (a: string) => 5;

  const myFuncTask = convertAsync(myAsync);

  const result = await myFuncTask("ok").runResult();
  expect(result).toEqual(5);
});

it("convertAsync should convert async", async () => {
  const myAsync = async (a: string) => {
    throw new Error("doh");
  };

  const myFuncTask = convertAsync(myAsync);

  const result = await myFuncTask("ok").run();
  expect(result.tag).toEqual("error");
  expect(result.value).toEqual(new Error("doh"));
});
