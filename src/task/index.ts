/* eslint-disable @typescript-eslint/no-redeclare */
import { Either } from "../either";
import { Operation, Ops } from "./internal/operations";
import { runAsPromiseResult } from "./internal/runAsPromiseResult";
import { runner } from "./internal/runner";
import { Stack } from "./internal/stack";
// import { as } from "./combinators";

/**
 * Tasks are data structures that describe asynchronous operations that can succeed with a result value R or fail with a value E that depends on some dependencies D.
 */
export interface Task<E, R> {
  /**
   * This is an internal property, an immutable stack of the current operations.
   */
  __ops: Stack<Operation>;
  /**
   * Tap into the result type of the current Task.
   */
  tap: <R2>(f: (_: R) => void) => Task<E, R>;
  /**
   * Returns an Task with the result value mapped by the function f.
   */
  map: <R2>(f: (_: R) => R2) => Task<E, R2>;
  /**
   * Returns a new Task requiring the dependencies of the first Task & the second Task, by passing the result of the first Task to the function f.
   */
  flatMap: <E2, R2>(f: (_: R) => Task<E2, R2>) => Task<E | E2, R2>;
  /**
   * Returns an Task with the error value mapped by the function f.
   */
  flatMapIf: <E2, R2>(
    c: boolean,
    f: (_: R) => Task<E2, R2>
  ) => Task<E | E2, R | R2>;
  /**
   * Returns an Task with the error value mapped by the function f.
   */
  leftMap: <E2>(f: (_: E) => E2) => Task<E2, R>;
  /**
   * Returns an Task with the error value mapped by the function f.
   */
  leftFlatMap: <E2>(f: (_: E) => Task<never, E2>) => Task<E2, R>;
  /**
   * Returns an Task with the error value mapped by the function f, and the result value mapped by function g.
   */
  biMap: <E2, R2>(f: (_: E) => E2, g: (_: R) => R2) => Task<E2, R2>;
  /**
   * Returns an Task that will run the second Task if the first fails.
   */
  orElse: <E2, R2>(f: Task<E2, R2>) => Task<E2, R | R2>;
  /**
   * Returns an Task that will run the second Task only if the first fails and the predicate returns true.
   */
  ifOrElse<E2, R2>(
    predicate: (_: E) => boolean,
    f: Task<E2, R2>
  ): Task<E | E2, R | R2>;
  /**
   * Returns an Task with the result values in a tuple of the two grouped Tasks.
   */
  group: <E2, R2>(f: Task<E2, R2>) => Task<E | E2, [R, R2]>;
  /**
   * Returns an Task with the first result value of the two grouped Tasks.
   */
  groupFirst: <E2, R2>(f: Task<E2, R2>) => Task<E | E2, R>;
  /**
   * Returns an Task with the second result value of the two grouped Tasks.
   */
  groupSecond: <E2, R2>(f: Task<E2, R2>) => Task<E | E2, R2>;
  /**
   * Returns an Task with the result values in a tuple of the two grouped Tasks, running the operations in parallel.
   */
  groupParallel: <E2, R2>(f: Task<E2, R2>) => Task<E | E2, [R, R2]>;
  /**
   * bracket is useful for modelling effects that consume resources that are used and then released, it accepts a 'release' function that always executes after the second argument 'usage' function has executed, regardless of if it has failed or succeeded. The return type is an Task with the result type determined by the 'usage' function.
   */
  bracket: <D2>(
    f: (_: R) => Task<never, any>
  ) => <D3, E2, R2>(g: (_: R) => Task<E2, R2>) => Task<E | E2, R2>;
  /**
   * Executes this Task, returning a promise with an object of the outcomes.
   */
  runAsPromise: () => Promise<{
    hasError: boolean;
    error: E;
    result: R;
    failure?: unknown;
  }>;
  /**
   * Unsafely executes this Task, returning a promise with the result or throwing an Error with an object of type `{ tag: 'error' | 'failure' , value: E | Error }` in an error or exception case.
   */
  runAsPromiseResult: () => Promise<R>;
  /**
   * Executes this Task with the given handler functions, returning a cancel function.
   */
  run: <R2, E2, F>(
    mapResult: (_: R) => R2,
    mapError: (_: E) => E2,
    handleFailure?: (_: unknown) => F
  ) => () => void;
  /**
   * Like flatmap but accepts a function returning a Promise<Either>.
   */
  flatMapF: <E2, R2>(
    f: (_: R) => () => Promise<Either<E2, R2>>
  ) => Task<E | E2, R2>;
  /**
   * Like orElse but accepts a function returning a Promise<Either>.
   */
  orElseF: <E2, R2>(f: () => Promise<Either<E2, R2>>) => Task<E2, R | R2>;
  /**
   * Like group but accepts a function returning a Promise<Either>.
   */
  groupF: <E2, R2>(f: () => Promise<Either<E2, R2>>) => Task<E | E2, [R, R2]>;
  /**
   * Like groupFirst but accepts a function returning a Promise<Either>.
   */
  groupFirstF: <E2, R2>(f: () => Promise<Either<E2, R2>>) => Task<E | E2, R>;
  /**
   * Like groupSecond but accepts a function returning a Promise<Either>.
   */
  groupSecondF: <E2, R2>(f: () => Promise<Either<E2, R2>>) => Task<E | E2, R2>;
}

class InternalTask<E, R> {
  private ctx: any;

  private operations: Stack<Operation>;

  public get __ops(): Stack<Operation> {
    return this.operations;
  }

  static all<E, R>(f: Task<E, R>[], concurrencyLimit?: number): Task<E, R[]> {
    return new InternalTask<E, R[]>(
      undefined,
      new Stack({
        _tag: Ops.all,
        f,
        concurrencyLimit,
      })
    ) as Task<E, R[]>;
  }

  static race<D, E, R>(f: Task<E, R>[]): Task<E, R> {
    return new InternalTask<E, R>(
      undefined,
      new Stack({
        _tag: Ops.race,
        f,
      })
    ) as Task<E, R>;
  }

  static of<D, E, R>(f: () => Promise<Either<E, R>>): Task<E, R> {
    return new InternalTask(f) as Task<E, R>;
  }

  static resolve<R, D = {}>(f: R): Task<never, R> {
    return new InternalTask(
      undefined,
      new Stack({
        _tag: Ops.value,
        f,
      })
    ) as any;
  }

  // TODO: reader D
  static construct<D, E, R>(
    f: () => (
      resolve: (_: R) => void,
      reject: (_: E) => void
    ) => void | (() => void)
  ): Task<E, R> {
    return new InternalTask(
      undefined,
      new Stack({
        _tag: Ops.construct,
        f,
      })
    ) as Task<E, R>;
  }

  private constructor(
    f?: () => Promise<Either<E, R>>,
    initialOps?: Stack<Operation>
  ) {
    this.operations =
      initialOps ||
      new Stack<{ _tag: Ops; f: any }>({
        _tag: Ops.promiseBased,
        f,
      });
  }

  tap(f: (_: R) => void): Task<E, R> {
    return new InternalTask<E, R>(
      undefined,
      this.operations.prepend({
        _tag: Ops.map,
        f: (r) => {
          f(r);
          return r;
        },
      })
    ) as Task<E, R>;
  }

  map<R2>(f: (_: R) => R2): Task<E, R2> {
    if (this.operations.head?.val?._tag === Ops.value) {
      return new InternalTask<E, R2>(
        undefined,
        new Stack({
          _tag: Ops.value,
          f: f(this.operations.head?.val?.f),
        })
      ) as Task<E, R2>;
    }
    return new InternalTask<E, R2>(
      undefined,
      this.operations.prepend({
        _tag: Ops.map,
        f,
      })
    ) as Task<E, R2>;
  }

  biMap<E2, R2>(f: (_: E) => E2, g: (_: R) => R2): Task<E2, R2> {
    return new InternalTask<E2, R2>(
      undefined,
      this.operations
        .prepend({
          _tag: Ops.map,
          f: g,
        })
        .prepend({
          _tag: Ops.leftMap,
          f,
        })
    ) as Task<E2, R2>;
  }

  leftMap<E2>(f: (_: E) => E2): Task<E2, R> {
    return new InternalTask<E2, R>(
      undefined,
      this.operations.prepend({
        _tag: Ops.leftMap,
        f,
      })
    ) as Task<E2, R>;
  }

  flatMap<E2, R2>(f: (_: R) => Task<E2, R2>): Task<E | E2, R2> {
    return new InternalTask<E | E2, R2>(
      undefined,
      this.operations.prepend({
        _tag: Ops.flatMap,
        f,
      })
    ) as Task<E | E2, R2>;
  }

  flatMapIf<E2, R2>(
    c: boolean,
    f: (_: R) => Task<E2, R2>
  ): Task<E | E2, R | R2> {
    if (c) {
      return new InternalTask<E | E2, R | R2>(
        undefined,
        this.operations.prepend({
          _tag: Ops.flatMap,
          f,
        })
      ) as Task<E | E2, R | R2>;
    }
    return new InternalTask<E | E2, R | R2>(undefined, this.operations) as Task<
      E | E2,
      R | R2
    >;
  }

  leftFlatMap<E2>(f: (_: E) => Task<never, E2>): Task<E2, R> {
    return new InternalTask<E2, R>(
      undefined,
      this.operations.prepend({
        _tag: Ops.leftFlatMap,
        f,
      })
    ) as Task<E2, R>;
  }

  race<E, R>(f: Task<E, R>): Task<E, R> {
    return new InternalTask<E, R>(
      undefined,
      new Stack({
        _tag: Ops.race,
        f: [this, f],
      })
    ) as Task<E, R>;
  }

  groupParallel<E2, R2>(f: Task<E2, R2>): Task<E | E2, [R, R2]> {
    return new InternalTask<E | E2, [R, R2]>(
      undefined,
      new Stack({
        _tag: Ops.all,
        f: [this, f],
      })
    ) as Task<E | E2, [R, R2]>;
  }

  flatMapF<E2, R2>(
    f: (_: R) => () => Promise<Either<E2, R2>>
  ): Task<E | E2, R2> {
    return new InternalTask<E | E2, R2>(
      undefined,
      this.operations.prepend({
        _tag: Ops.flatMap,
        f: f as any,
      })
    ) as Task<E | E2, R2>;
  }

  orElse<E2, R2>(f: Task<E2, R2>): Task<E2, R | R2> {
    return new InternalTask<E2, R | R2>(
      undefined,
      this.operations.prepend({
        _tag: Ops.orElse,
        f,
      })
    ) as Task<E2, R | R2>;
  }

  ifOrElse<E2, R2>(
    predicate: (_: E) => boolean,
    f: Task<E2, R2>
  ): Task<E | E2, R | R2> {
    return new InternalTask<E | E2, R | R2>(
      undefined,
      this.operations.prepend({
        _tag: Ops.ifOrElse,
        f: [predicate, f],
      })
    ) as Task<E | E2, R | R2>;
  }

  orElseF<E2, R2>(f: () => Promise<Either<E2, R2>>): Task<E2, R | R2> {
    return new InternalTask<E2, R | R2>(
      undefined,
      this.operations.prepend({
        _tag: Ops.orElse,
        f,
      })
    ) as Task<E2, R | R2>;
  }

  group<E2, R2>(f: Task<E2, R2>): Task<E | E2, [R, R2]> {
    return new InternalTask<E | E2, [R, R2]>(
      undefined,
      this.operations.prepend({
        _tag: Ops.group,
        f,
      })
    ) as Task<E | E2, [R, R2]>;
  }

  groupF<E2, R2>(f: () => Promise<Either<E2, R2>>): Task<E | E2, [R, R2]> {
    return new InternalTask<E | E2, [R, R2]>(
      undefined,
      this.operations.prepend({
        _tag: Ops.group,
        f,
      })
    ) as Task<E | E2, [R, R2]>;
  }

  groupFirst<E2, R2>(f: Task<E2, R2>): Task<E | E2, R> {
    return new InternalTask<E | E2, R>(
      undefined,
      this.operations.prepend({
        _tag: Ops.groupFirst,
        f,
      })
    ) as Task<E | E2, R>;
  }

  groupFirstF<E2, R2>(f: () => Promise<Either<E2, R2>>): Task<E2, R> {
    return new InternalTask<E2, R>(
      undefined,
      this.operations.prepend({
        _tag: Ops.groupFirst,
        f,
      })
    ) as Task<E2, R>;
  }

  groupSecond<E2, R2>(f: Task<E2, R2>): Task<E2, R2> {
    return new InternalTask<E2, R2>(
      undefined,
      this.operations.prepend({
        _tag: Ops.groupSecond,
        f,
      })
    ) as Task<E2, R2>;
  }

  groupSecondF<E2, R2>(f: () => Promise<Either<E2, R2>>): Task<E2, R2> {
    return new InternalTask<E2, R2>(
      undefined,
      this.operations.prepend({
        _tag: Ops.groupSecond,
        f,
      })
    ) as Task<E2, R2>;
  }

  bracket(f: (_: R) => Task<never, any>) {
    return <E2, R2>(g: (_: R) => Task<E2, R2>): Task<E | E2, R2> =>
      new InternalTask<E2, R2>(
        undefined,
        this.operations.prepend({
          _tag: Ops.bracket,
          f: [f, g],
        })
      ) as Task<E | E2, R2>;
  }

  async runAsPromiseResult() {
    const r = runner(this.operations);
    return runAsPromiseResult(r);
  }

  run<R21, E2, F>(
    mapResult: (_: R) => R21,
    mapError: (_: E) => E2,
    handleFailure?: (_: unknown) => F
  ) {
    const _runner = runner(this.operations);
    setImmediate(() => {
      _runner.run().then(({ hasError, error, result, failure }) => {
        if (!_runner.cancelled()) {
          if (failure) {
            if (handleFailure) {
              handleFailure(failure);
            } else {
              throw failure;
            }
          } else if (hasError) {
            mapError(error);
          } else {
            mapResult(result);
          }
        }
      });
    });
    return () => _runner.cancel();
  }

  async runAsPromise() {
    const { hasError, failure, error, result } = await runner(
      this.operations
    ).run();
    return {
      result,
      hasError,
      error,
      failure,
    };
  }
}

export const Task = <E, R>(f: () => Promise<Either<E, R>>): Task<E, R> =>
  InternalTask.of(f);

/**
 * Similiar to `Promise.all`, returns an Task where all operations will be run in parallel returning an array of R values. Optional a concurrency limit can be specified.
 */
export const all = <E, R>(
  f: Task<E, R>[],
  concurrencyLimit?: number
): Task<E, R[]> => InternalTask.all(f, concurrencyLimit);

/**
 * Similiar to `Promise.race`, returns an Task where the R value from the first succesful operation will be returned.
 */
export const race = <E, R>(f: Task<E, R>[]): Task<E, R> => InternalTask.race(f);

/**
 * Resolve an Task with the specified value.
 */
export const resolve = <R>(a: R): Task<never, R> => InternalTask.resolve(a);

/**
 * Similiar to `new Promise`, an optional 'tidy up' function can be returned to tidy up resources upon cancellation.
 */
export const construct = <E, R>(
  f: () => (
    resolve: (_: R) => void,
    reject: (_: E) => void
  ) => void | (() => void)
): Task<E, R> => InternalTask.construct(f);

// TODO: make constructTask more efficient in runner

/**
 * Similiar to `construct` but useful for when no dependencies are required from the returned Task.
 */
export const constructTask = <E, R>(
  f: (resolve: (_: R) => void, reject: (_: E) => void) => void | (() => void)
): Task<E, R> => InternalTask.construct(() => f);
