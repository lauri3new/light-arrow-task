import { Task } from "../index";
import { Left, Right } from "../../either";

it("Task should flatMapF", async () => {
  const result = await Task<never, number>(async () => Right(1))
    .flatMapF((a) => async () => Right(a * 3))
    .runAsPromiseResult();
  expect(result).toEqual(3);
});

it("Task should flatMapF - dependency", async () => {
  const result = await Task<never, number>(async () => Right(1))
    .flatMapF((a) => async () => Right(a * 3))
    .runAsPromiseResult();
  expect(result).toEqual(3);
});

it("Task should flatMapF - fail", async () => {
  const { error, result } = await Task<number, never>(async () => Left(1))
    .flatMapF((a) => async () => Right(a * 3))
    .runAsPromise();
  expect(result).toEqual(undefined);
  expect(error).toEqual(1);
});

it("Task should groupF", async () => {
  const result = await Task<never, number>(async () => Right(1))
    .groupF(async () => Right(2))
    .runAsPromiseResult();
  expect(result).toEqual([1, 2]);
});

it("Task should groupF - fail", async () => {
  const { result, error } = await Task<never, number>(async () => Right(1))
    .groupF(async () => Left(2))
    .runAsPromise();
  expect(result).toEqual(1);
  expect(error).toEqual(2);
});

it("Task should group firstF", async () => {
  const result = await Task<never, number>(async () => Right(1))
    .groupFirstF(async () => Right(2))
    .runAsPromiseResult();
  expect(result).toEqual(1);
});

it("Task should group secondF", async () => {
  const result = await Task<never, number>(async () => Right(1))
    .groupSecondF(async () => Right(2))
    .runAsPromiseResult();
  expect(result).toEqual(2);
});

it("Task should orElseF", async () => {
  const result = await Task<number, never>(async () => Left(1))
    .orElseF(async () => Right(2))
    .runAsPromiseResult();
  expect(result).toEqual(2);
});

it("Task should orElseF", async () => {
  const a = Task<number, never>(async () => Left(1)).orElseF(async () =>
    Left(2)
  );

  const result = await a.orElseF(async () => Right(2)).runAsPromiseResult();
  expect(result).toEqual(2);
});
