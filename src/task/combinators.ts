import { Right } from "../either/index";
import { all, Task, resolve } from "./index";

/**
 * Returns a Task that will return the result value of the first succesful Task.
 */
export function ifOrElse<E1, R1, E2, R2>(
  predicate: (_: E1) => boolean,
  a: Task<E1, R1>,
  b: Task<E2, R2>
): Task<E1 | E2, R1 | R2>;
export function ifOrElse<E1, R1, E2, R2, E3, R3>(
  predicate: (_: E1 | E2) => boolean,
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>
): Task<E1 | E2 | E3, R1 | R2 | R3>;
export function ifOrElse<E1, R1, E2, R2, E3, R3, E4, R4>(
  predicate: (_: E1 | E2 | E3) => boolean,
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>
): Task<E1 | E2 | E3 | E4, R1 | R2 | R3 | R4>;
export function ifOrElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5
>(
  predicate: (_: E1 | E2 | E3 | E4) => boolean,
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>
): Task<E1 | E2 | E3 | E4 | E5, R1 | R2 | R3 | R4 | R5>;
export function ifOrElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6
>(
  predicate: (_: E1 | E2 | E3 | E4 | E5) => boolean,
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>
): Task<E1 | E2 | E3 | E4 | E5 | E6, R1 | R2 | R3 | R4 | R5 | R6>;
export function ifOrElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7
>(
  predicate: (_: E1 | E2 | E3 | E4 | E5 | E6) => boolean,
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>
): Task<E1 | E2 | E3 | E4 | E5 | E6 | E7, R1 | R2 | R3 | R4 | R5 | R6 | R7>;
export function ifOrElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7,
  D8,
  E8,
  R8
>(
  predicate: (_: E1 | E2 | E3 | E4 | E5 | E6 | E7) => boolean,
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>,
  h: Task<E8, R8>
): Task<
  E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8,
  R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8
>;
export function ifOrElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7,
  D8,
  E8,
  R8,
  D9,
  E9,
  R9
>(
  predicate: (_: E1 | E2 | E3 | E4 | E5 | E6 | E7) => boolean,
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>,
  h: Task<E8, R8>,
  i: Task<E9, R9>
): Task<
  E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9,
  R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9
>;
export function ifOrElse(predicate: any, ...as: any[]) {
  if (as.length === 1) return as[0];
  if (as.length === 2) return as[0].ifOrElse(predicate, as[1]);
  const [a, b, ...aas] = as;
  // @ts-ignore
  return ifOrElse(a.ifOrElse(predicate, b), ...aas);
}

/**
 * Returns an Task that will return the result value of the first succesful Task.
 */
export function orElse<E1, R1, E2, R2>(
  a: Task<E1, R1>,
  b: Task<E2, R2>
): Task<E2, R1 | R2>;
export function orElse<E1, R1, E2, R2, E3, R3>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>
): Task<E3, R1 | R2 | R3>;
export function orElse<E1, R1, E2, R2, E3, R3, E4, R4>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>
): Task<E4, R1 | R2 | R3 | R4>;
export function orElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>
): Task<E5, R1 | R2 | R3 | R4 | R5>;
export function orElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>
): Task<E6, R1 | R2 | R3 | R4 | R5 | R6>;
export function orElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>
): Task<E7, R1 | R2 | R3 | R4 | R5 | R6 | R7>;
export function orElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7,
  D8,
  E8,
  R8
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>,
  h: Task<E8, R8>
): Task<E8, R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8>;
export function orElse<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7,
  D8,
  E8,
  R8,
  D9,
  E9,
  R9
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>,
  h: Task<E8, R8>,
  i: Task<E9, R9>
): Task<E9, R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9>;
export function orElse(...as: any[]) {
  if (as.length === 1) return as[0];
  if (as.length === 2) return as[0].orElse(as[1]);
  const [a, b, ...aas] = as;
  // @ts-ignore
  return orElse(a.orElse(b), ...aas);
}

/**
 * Returns an Task with the result values in a tuple of the grouped Tasks.
 */
export function group<E1, R1, E2, R2>(
  a: Task<E1, R1>,
  b: Task<E2, R2>
): Task<E1 | E2, [R1, R2]>;
export function group<E1, R1, E2, R2, E3, R3>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>
): Task<E1 | E2 | E3, [R1, R2, R3]>;
export function group<E1, R1, E2, R2, E3, R3, E4, R4>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>
): Task<E1 | E2 | E3 | E4, [R1, R2, R3, R4]>;
export function group<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>
): Task<E1 | E2 | E3 | E4 | E5, [R1, R2, R3, R4, R5]>;
export function group<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>
): Task<E1 | E2 | E3 | E4 | E5 | E6, [R1, R2, R3, R4, R5, R6]>;
export function group<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>
): Task<E1 | E2 | E3 | E4 | E5 | E6 | E7, [R1, R2, R3, R4, R5, R6, R7]>;
export function group<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7,
  D8,
  E8,
  R8
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>,
  h: Task<E8, R8>
): Task<
  E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8,
  [R1, R2, R3, R4, R5, R6, R7, R8]
>;
export function group<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7,
  D8,
  E8,
  R8,
  D9,
  E9,
  R9
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>,
  h: Task<E8, R8>,
  i: Task<E9, R9>
): Task<
  E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9,
  [R1, R2, R3, R4, R5, R6, R7, R8, R9]
>;
export function group(...as: Task<any, any>[]) {
  function runGroup(as: Task<any, any>[], first: boolean): any {
    if (as.length === 1) return as[0];
    if (as.length === 2 && first) return as[0].group(as[1]);
    if (as.length === 2)
      return as[0].group(as[1]).map(([c1, c2]) => [...c1, c2]);
    const [a, b, ...aas] = as;
    if (first) {
      return runGroup([a.group(b), ...aas], false);
    }
    return runGroup([a.group(b).map(([c1, c2]) => [...c1, c2]), ...aas], false);
  }
  return runGroup(as, true);
}

/**
 * Returns an Task with the result values in a tuple of the two grouped Tasks, running the operations in parallel.
 */
export function groupParallel<E1, R1, E2, R2>(
  a: Task<E1, R1>,
  b: Task<E2, R2>
): Task<E1 | E2, [R1, R2]>;
export function groupParallel<E1, R1, E2, R2, E3, R3>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>
): Task<E1 | E2 | E3, [R1, R2, R3]>;
export function groupParallel<E1, R1, E2, R2, E3, R3, E4, R4>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>
): Task<E1 | E2 | E3 | E4, [R1, R2, R3, R4]>;
export function groupParallel<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>
): Task<E1 | E2 | E3 | E4 | E5, [R1, R2, R3, R4, R5]>;
export function groupParallel<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>
): Task<E1 | E2 | E3 | E4 | E5 | E6, [R1, R2, R3, R4, R5, R6]>;
export function groupParallel<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>
): Task<E1 | E2 | E3 | E4 | E5 | E6 | E7, [R1, R2, R3, R4, R5, R6, R7]>;
export function groupParallel<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7,
  D8,
  E8,
  R8
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>,
  h: Task<E8, R8>
): Task<
  E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8,
  [R1, R2, R3, R4, R5, R6, R7, R8]
>;
export function groupParallel<
  D1,
  E1,
  R1,
  D2,
  E2,
  R2,
  D3,
  E3,
  R3,
  D4,
  E4,
  R4,
  D5,
  E5,
  R5,
  D6,
  E6,
  R6,
  D7,
  E7,
  R7,
  D8,
  E8,
  R8,
  D9,
  E9,
  R9
>(
  a: Task<E1, R1>,
  b: Task<E2, R2>,
  c: Task<E3, R3>,
  d: Task<E4, R4>,
  e: Task<E5, R5>,
  f: Task<E6, R6>,
  g: Task<E7, R7>,
  h: Task<E8, R8>,
  i: Task<E9, R9>
): Task<
  E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9,
  [R1, R2, R3, R4, R5, R6, R7, R8, R9]
>;
export function groupParallel(...as: Task<any, any>[]) {
  function runGroup(as: Task<any, any>[], first: boolean): any {
    if (as.length === 1) return as[0];
    if (as.length === 2 && first) return as[0].groupParallel(as[1]);
    if (as.length === 2)
      return as[0].groupParallel(as[1]).map(([c1, c2]) => [...c1, c2]);
    const [a, b, ...aas] = as;
    if (first) {
      return runGroup([a.groupParallel(b), ...aas], false);
    }
    return runGroup(
      [a.groupParallel(b).map(([c1, c2]) => [...c1, c2]), ...aas],
      false
    );
  }
  return runGroup(as, true);
}

/**
 * Convert an array of Tasks into a single Task returning a array of result (R) values, running the operations in sequence.
 */
export const sequence = <D, E, R>(as: Task<E, R>[]): Task<E, R[]> =>
  as.reduce(
    (acc, TaskR) => acc.flatMap((a: any) => TaskR.map((c) => [...a, c])),
    Task<E, R[]>(async () => Right<R[]>([]))
  );

/**
 * Returns an Task that will repeat the operation and returns with the result value of the last Task.
 */
export const retry =
  (n: number) =>
  <D, E, R>(a: Task<E, R>): Task<E, R> =>
    n === 1 ? a : a.orElse(retry(n - 1)(a));

/**
 * Returns an Task that will repeat the operation until first succesful run.
 */
export const repeat =
  (n: number) =>
  <D, E, R>(a: Task<E, R>): Task<E, R> =>
    n === 1 ? a : a.groupSecond(repeat(n - 1)(a));

// Functor

export const as = <D, E, R, R1>(a: Task<E, R>, r: R1): Task<E, R1> =>
  a.map(() => r);

export const lift =
  <R, R1>(f: (_: R) => R1) =>
  <D, E>(a: Task<E, R>) =>
    a.map(f);

export const product =
  <D, E, R>(a: Task<E, R>) =>
  <R1>(f: (_: R) => R1): Task<E, [R, R1]> =>
    a.map((r) => [r, f(r)]);

export const productLeft =
  <D, E, R>(a: Task<E, R>) =>
  <R1>(f: (_: R) => R1): Task<E, [R1, R]> =>
    a.map((r) => [f(r), r]);

export const tupleLeft = <D, E, R, R1>(
  a: Task<E, R>,
  r1: R1
): Task<E, [R1, R]> => a.map((r) => [r1, r]);

export const tupleRight = <D, E, R, R1>(
  a: Task<E, R>,
  r1: R1
): Task<E, [R, R1]> => a.map((r) => [r, r1]);

export const voidR = <D, E, R>(a: Task<E, R>): Task<E, void> =>
  a.map(() => undefined);

export const tap =
  <D, E, R>(f: (_: R) => void) =>
  (a: Task<E, R>) =>
    a.map((r) => {
      f(r);
      return r;
    });

// traverse innit..

export const traverse =
  <A>(as: A[]) =>
  <D, E, R>(f: (_: A) => Task<E, R>): Task<E, R[]> =>
    sequence(as.map(f));
export const traverseParallel =
  <A>(as: A[]) =>
  <D, E, R>(f: (_: A) => Task<E, R>): Task<E, R[]> =>
    all(as.map(f));
export const forEach = traverse;
export const forEachParallel = traverseParallel;

// applicative

// monad

export const flatten = <D, E, E2, R>(
  a: Task<E, Task<E2, R>>
): Task<E | E2, R> => a.flatMap((a) => a);

export const map2 =
  <E, E2, R, R1, R2>(f: (_: R, __: R1) => R2) =>
  (a: Task<E, R>, b: Task<E2, R1>): Task<E | E2, R2> =>
    a.flatMap((r) => b.map((r1) => f(r, r1)));
