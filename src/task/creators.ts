import { Either, left, right } from "../either/index";
import { Task } from "./index";

/**
 * Create a task.
 */
export const task = <E, R>(
  f: (_: {
    left: <X>(__: X) => left<X>;
    right: <Y>(__: Y) => right<Y>;
  }) => Promise<Either<E, R>>
): Task<E, R> =>
  Task(() =>
    f({
      left: left,
      right: right,
    })
  );

/**
 * Create an Task from a value with the error type as the value type.
 */
export const reject = <E>(a: E): Task<E, never> => Task(async () => left(a));

/**
 * Create an Task from a nullable value with either the error type as null or the result type as the value type.
 */
export const fromNullable = <R>(a: R | null | undefined): Task<null, R> =>
  Task(async () => (a === undefined || a === null ? left(null) : right(a)));

/**
 * Create an Task from an Either type.
 */
export const fromEither = <E, R>(a: Either<E, R>): Task<E, R> =>
  Task(async () => a);

/**
 * Create a function returning an Task from an async function.
 */
export const convertAsync =
  <A, R, E = Error>(f: (_: A) => Promise<R>): ((__: A) => Task<E, R>) =>
  (a: A) =>
    Task(async () => f(a).then(right).catch(left));

/**
 * Create a function returning an Task from an async function.
 */
export const convertAsyncE =
  <E>() =>
  <A, R>(f: (_: A) => Promise<R>): ((__: A) => Task<E, R>) =>
  (a: A) =>
    Task(async () => f(a).then(right).catch(left));

/**
 * Create a function returning an Task from an async function.
 */
export const convertAsyncNullable =
  <A, R>(
    f: (_: A) => Promise<R | null | undefined>
  ): ((__: A) => Task<null, R>) =>
  (a: A) =>
    Task(async () =>
      f(a).then((b) => (b === undefined || b === null ? left(null) : right(b)))
    );
