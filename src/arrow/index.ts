import {
  Either, Left, Right
} from '../either/index'

// interface

export interface Arrow<D, E, A> {
  __val: (_:D) => Promise<Either<E, A>>
  map: <B>(f: (_:A) => B) => Arrow<D, E, B>
  leftMap: <E2>(f: (_:E) => E2) => Arrow<D, E2, A>
  biMap: <E2, B>(f: (_:E) => E2, g: (_:A) => B) => Arrow<D, E2, B>
  flatMap: <D2, E2, B>(f: (_:A) => Arrow<D2, E2, B>) => Arrow<D & D2, E | E2, B>
  provide: (_:D) => Arrow<void, E, A>
  modifyDependencies: <E2, D2 extends D>(f:(_:D) => Promise<Either<E2, D2>>) => Arrow<D, E | E2, A>
  flatMapFunction: <E2, B>(f: (_:A) => (_:D) => Promise<Either<E2, B>>) => Arrow<D, E | E2, B>
  andThen: <E2, B>(_: Arrow<A, E2, B>) => Arrow<D, E | E2, B>
  andThenFunction: <E2, B>(f: (_:A) => Promise<Either<E2, B>>) => Arrow<D, E | E2, B>
  combine: <E2, B>(f:Arrow<D, E2, B>) => Arrow<D, E2, A | B>
  runAsPromise: (
    context: D
  ) => Promise<A>
  run: <B, E2, ER>(
    context: D,
    f: (_:A) => B,
    g: (_:E) => E2,
    j: (_?: Error) => ER
  ) => void
}

// implementation

export const Arrow = <D, E, A>(__val: (_:D) => Promise<Either<E, A>>):Arrow<D, E, A> => ({
  __val,
  map: <B>(f: (_:A) => B):Arrow<D, E, B> => Arrow<D, E, B>((_:D) => __val(_).then(a => a.map(f))),
  leftMap: <E2>(f: (_:E) => E2):Arrow<D, E2, A> => Arrow<D, E2, A>((_:D) => __val(_).then(a => a.leftMap(f))),
  biMap: <E2, B>(f: (_:E) => E2, g: (_:A) => B) => Arrow<D, E2, B>((_:D) => __val(_).then(a => a.biMap(f, g))),
  flatMap: <D2, E2, B>(f: (_:A) => Arrow<D2, E2, B>):Arrow<D & D2, E | E2, B> => Arrow<D & D2, E | E2, B>(
    (a: D & D2) => __val(a).then((eitherD2): Promise<Either<E | E2, B>> => eitherD2.match(
      e => Promise.resolve(Left(e)),
      s2 => f(s2).__val(a)
    ))
  ),
  provide: (ds: D) => Arrow((d) => __val(ds)),
  flatMapFunction: <E2, B>(f: (_:A) => (_:D) => Promise<Either<E2, B>>):Arrow<D, E | E2, B> => Arrow<D, E | E2, B>(
    (a: D) => __val(a).then((eitherD2): Promise<Either<E | E2, B>> => eitherD2.match(
      e => Promise.resolve(Left(e)),
      s2 => f(s2)(a)
    ))
  ),
  andThen: <E2, B>(f: Arrow<A, E2, B>):Arrow<D, E | E2, B> => Arrow<D, E | E2, B>(
    (a: D) => __val(a).then((eitherD2): Promise<Either<E | E2, B>> => eitherD2.match(
      e => Promise.resolve(Left(e)),
      s2 => f.__val(s2)
    ))
  ),
  andThenFunction: <E2, B>(f: (_:A) => Promise<Either<E2, B>>):Arrow<D, E | E2, B> => Arrow<D, E | E2, B>(
    (a: D) => __val(a).then((eitherD2): Promise<Either<E | E2, B>> => eitherD2.match(
      e => Promise.resolve(Left(e)),
      s2 => f(s2)
    ))
  ),
  combine: <E2, B>(f:Arrow<D, E2, B>):Arrow<D, E2, A | B> => Arrow<D, E2, A | B>(
    (c: D) => __val(c)
      .then(
        (eitherA): Promise<Either<E2, A | B>> => eitherA.match(
          e => f.__val(c),
          a => Promise.resolve(Right(a))
        )
      )
  ),
  runAsPromise: (
    context: D
  ) => __val(context).then(
    (eitherD) => eitherD.match(
      none => { throw none },
      some => some
    )
  ),
  modifyDependencies: <E2, D2 extends D>(f:(_:D) => Promise<Either<E2, D2>>) => Arrow<D, E | E2, A>((c: D) => __val(c)
    .then(
      (eitherA): Promise<Either<E | E2, A>> => eitherA.match(
        e => Promise.resolve(Left(e)),
        a => f(c).then(eitherE => eitherE.match(
          e => Promise.resolve(Left(e)),
          () => Promise.resolve(Right(a))
        ))
      )
    )),
  run: <B, E2, F>(
    context: D,
    f: (_:A) => B,
    g: (_:E) => E2,
    j: (_?: Error) => F
  ) => {
    __val(context).then(
      (eitherD) => eitherD.match(
        none => g(none),
        some => f(some)
      )
    )
      .catch(
        j
      )
  }
})

// helpers/constructors

export const draw = <D, D2, E, A>(f:(_:D) => Arrow<D2, E, A>): Arrow<D & D2, E, A> => Arrow<D & D2, E, A>(
  (a: D & D2) => f(a).__val(a)
)

export const provideSome = <D>(d: D) => <D2, E, A>(a: Arrow<D & D2, E, A>): Arrow<D2, E, A> => Arrow<D2, E, A>(
  (ds: D2) => a.__val({ ...ds, ...d })
)

export const resolve = <A, E = never, D = object>(a: A):Arrow<D, E, A> => Arrow(async (_:D) => Right(a))

export const reject = <E, A = never, D = object>(a: E):Arrow<D, E, A> => Arrow(async (_:D) => Left(a))

// export const fromNullable = <A, B, C = any>(a: A | null | undefined): Arrow<C, null, A> => Arrow(async (_: C) => eitherFromNullable(a))

export const fromEither = <E, A, D = object>(a:Either<E, A>):Arrow<D, E, A> => Arrow(async (_:any) => a)

// TODO: rename more friendly

export const fromDrawPromise = <D, A>(a:(_:D) => Promise<A>):Arrow<D, never, A> => Arrow((s: D) => a(s).then(Right))

export const fromFailableDrawPromise = <D, E, A>(a:(_:D) => Promise<A>):Arrow<D, E, A> => Arrow((s:D) => a(s).then(Right).catch((e) => Left<E>(e)))

// combinators

export const sequence = <D, B, C>(as: Arrow<D, B, C>[]): Arrow<D, B, C[]> => as.reduce(
  (acc, arrowA) => acc.flatMap((a) => arrowA.map(c => [...a, c])), Arrow<D, B, C[]>(async (_: D) => Right<C[]>([]))
)

export const combine = <D, B, C>(...as: Arrow<D, B, C>[]): Arrow<D, B, C> => {
  if (as.length === 1) return as[0]
  if (as.length === 2) return as[0].combine(as[1])
  const [a, b, ...aas] = as
  return combine(a.combine(b), ...aas)
}

export const retry = (n: number) => <D, B, C>(a: Arrow<D, B, C>): Arrow<D, B, C> => (n < 1 ? a : a.combine(retry(n - 1)(a)))

// kleisli combinators

export type Draw<D, A, B, C> = (a: (A)) => Arrow<D, B, C>

export function composeDraw <D1, A, B, C, D, E>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>): (d: A) => Arrow<D1, B | D, E>
export function composeDraw <D1, A, B, C, D, E, F, G>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>): (d: A) => Arrow<D1, B | D | F, G>
export function composeDraw <D1, A, B, C, D, E, F, G, H, I>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>): (d: A) => Arrow<D1, B | D | F | H, I>
export function composeDraw <D1, A, B, C, D, E, F, G, H, I, J, K>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>, e: Draw<D1, I, J, K>): (d: A) => Arrow<D1, B | D | F | H | J, K>
export function composeDraw <D1, A, B, C, D, E, F, G, H, I, J, K, L, M>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>, e: Draw<D1, I, J, K>, f: Draw<D1, K, L, M>)
  : (d: A) => Arrow<D1, B | D | F | H | J | L, M>
export function composeDraw <D1, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>, e: Draw<D1, I, J, K>, f: Draw<D1, K, L, M>, g: Draw<D1, M, N, O>)
  : (d: A) => Arrow<D1, B | D | F | H | J | L | N, O>
export function composeDraw <D1, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>, e: Draw<D1, I, J, K>, f: Draw<D1, K, L, M>, g: Draw<D1, M, N, O>, h: Draw<D1, O, P, Q>)
  : (d: A) => Arrow<D1, B | D | F | H | J | L | N | P, Q>
export function composeDraw <D1, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>, e: Draw<D1, I, J, K>, f: Draw<D1, K, L, M>, g: Draw<D1, M, N, O>, h: Draw<D1, O, P, Q>, i: Draw<D1, Q, R, S>)
  : (d: A) => Arrow<D1, B | D | F | H | J | L | N | P | R, S>
export function composeDraw<A>(...as: any[]) {
  return function (d: A) {
    const [aa, ...aas] = as
    if (aas && aas.length === 0) return aa(d)
    return aa(d).flatMap(
      // @ts-ignore
      composeDraw(...aas)
    )
  }
}

export const sequenceDraw = <D, C, E, A>(as: Draw<D, C, E, A>[]): Draw<D, C, E, A[]> => as.reduce(
  (acc, teaK) => (_: C) => teaK(_).flatMap(a => acc(_).map(aas => [a, ...aas])), (_: C) => Arrow<D, E, A[]>(() => Promise.resolve(Right<A[]>([])))
)

export function combineDraw <D1, A, B, C, D, E>(a: Draw<D1, A, B, C>, b: Draw<D1, A, D, E>): (d: A) => Arrow<D1, D, C | E>
export function combineDraw <D1, A, B, C, D, E, F, G>(a: Draw<D1, A, B, C>, b: Draw<D1, A, D, E>, c: Draw<D1, A, F, G>): (d: A) => Arrow<D1, F, C | E | G>
export function combineDraw <D1, A, B, C, D, E, F, G, H, I>(a: Draw<D1, A, B, C>, b: Draw<D1, A, D, E>, c: Draw<D1, A, F, G>, d: Draw<D1, A, H, I>): (d: A) => Arrow<D1, H, C | E | G | I>
export function combineDraw <D1, A, B, C, D, E, F, G, H, I, J, K>(a: Draw<D1, A, B, C>, b: Draw<D1, A, D, E>, c: Draw<D1, A, F, G>, d: Draw<D1, A, H, I>, e: Draw<D1, A, J, K>): (d: A) => Arrow<D1, J, C | E | G | I | K>
export function combineDraw <D1, A, B, C, D, E, F, G, H, I, J, K, L, M>(a: Draw<D1, A, B, C>, b: Draw<D1, A, D, E>, c: Draw<D1, A, F, G>, d: Draw<D1, A, H, I>, e: Draw<D1, A, J, K>, f: Draw<D1, A, L, M>)
    : (d: A) => Arrow<D1, L, C | E | G | I | K | M>
export function combineDraw <D1, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>, e: Draw<D1, I, J, K>, f: Draw<D1, K, L, M>, g: Draw<D1, M, N, O>)
    : (d: A) => Arrow<D1, N, C | E | G | I | K | M | O>
export function combineDraw <D1, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>, e: Draw<D1, I, J, K>, f: Draw<D1, K, L, M>, g: Draw<D1, M, N, O>, h: Draw<D1, O, P, Q>)
    : (d: A) => Arrow<D1, P, C | E | G | I | K | M | O | Q>
export function combineDraw <D1, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(a: Draw<D1, A, B, C>, b: Draw<D1, C, D, E>, c: Draw<D1, E, F, G>, d: Draw<D1, G, H, I>, e: Draw<D1, I, J, K>, f: Draw<D1, K, L, M>, g: Draw<D1, M, N, O>, h: Draw<D1, O, P, Q>, i: Draw<D1, Q, R, S>)
    : (d: A) => Arrow<D1, R, C | E | G | I | K | M | O | Q | S>
export function combineDraw <D, A>(...a: Draw<D, A, any, any>[]): Draw<D, A, any, any>
export function combineDraw<D, A>(...as: Draw<D, A, any, any>[]): Draw<D, A, any, any> {
  if (as.length === 1) return as[0]
  if (as.length === 2) return (c: A) => as[0](c).combine(as[1](c))
  const [a, b, ...aas] = as
  return combineDraw(combineDraw(a, b), ...aas)
}

export const retryDraw = (n: number) => <D, C, E, A>(a: Draw<D, C, E, A>): Draw<D, C, E, A> => (n < 1 ? a : combineDraw(a, (retryDraw(n - 1)(a))))

// type aliases
