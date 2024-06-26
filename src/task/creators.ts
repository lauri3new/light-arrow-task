import {
  Either, Left, Right, left, right, either
} from '../either/index'
import { Task } from './index'

/**
 * Create an Task from a value with the error type as the value type.
 */
export const reject = <E>(a: E): Task<E, never> => Task(async () => left(a))

/**
 * Create an Task from a nullable value with either the error type as null or the result type as the value type.
 */
export const fromNullable = <R>(a: R | null | undefined): Task<null, R> => Task(async () => (a === undefined || a === null ? left(null) : right(a)))

/**
 * Create an Task from an Either type.
 */
export const fromEither = <E, R>(a: Either<E, R>): Task<E, R> => Task(async () => a)

/**
 * Create a function returning an Task from an async function.
 */
export const convertAsync = <A, R, E = Error>(f: (_: A) => Promise<R>): ((__: A) => Task<E, R>) => (a: A) => Task(async () => f(a).then(right).catch(left))

/**
 * Create a function returning an Task from an async function.
 */
export const convertAsyncE = <E>() => <A, R>(f: (_: A) => Promise<R>): ((__: A) => Task<E, R>) => (a: A) => Task(async () => f(a).then(right).catch(left))

/**
 * Create a function returning an Task from an async function.
 */
export const convertAsyncNullable = <A, R>(
  f: (_: A) => Promise<R | null | undefined>
): ((__: A) => Task<null, R>) => (a: A) => Task(async () => f(a).then((b) => (b === undefined || b === null ? left(null) : right(b))))

/**
 * Create a task using helpers.
 */
export const task = <R, E>(f: (
  { right, left }: {
    right: <R1>(a: R1) => Right<R1>
    left: <E1>(a: E1) => Left<E1>
    fromNullable: <R>(a: R | null | undefined) => Either<null, R extends null | undefined ? never : R>
  }
) => Promise<Either<E, R>>): Task<E, R> => Task(async () => f({ right, left, fromNullable: either.fromNullable }))
