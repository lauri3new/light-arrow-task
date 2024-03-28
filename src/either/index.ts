// interface

export type Either<E, A> = {
  _tag: 'right'
  __val: A
  unwrap: () => {
    tag: 'right'
    val: A
  }
  leftMap:<B>(f:(_: E) => B) => Either<B, A>
  map:<B>(f:(_: A) => B) => Either<E, B>
  biMap:<E2, B>(f:(_: E) => E2, g:(_: A) => B) => Either<E2, B>
  flatMap:<EE, B>(f:(_: A) => Either<E | EE, B>) => Either<E | EE, B>
  fold:<B, C>(f:(_:E) => B, g:(_:A) => C) => B | C
} | {
  _tag: 'left'
  __val: E
  unwrap: () => {
    tag: 'left'
    val: E
  }
  leftMap:<B>(f:(_: E) => B) => Either<B, A>
  map:<B>(f:(_: A) => B) => Either<E, B>
  biMap:<E2, B>(f:(_: E) => E2, g:(_: A) => B) => Either<E2, B>
  flatMap:<EE, B>(f:(_: A) => Either<E | EE, B>) => Either<E | EE, B>
  fold:<B, C>(f:(_:E) => B, g:(_:A) => C) => B | C
}


// type aliases

export type Right<A> = Either<never, A>
export type Left<E> = Either<E, never>

// implementations

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const right = <A, E = never>(a: A): Either<E, A> => ({
  _tag: 'right',
  __val: a,
  unwrap: () => ({
    tag: 'right',
    val: a
  }),
  map: f => right(f(a)),
  leftMap: _ => right(a),
  biMap: (_, f) => right(f(a)),
  flatMap: f => f(a),
  fold: (_, f) => f(a)
})

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const left = <E, A = never>(a: E): Either<E, A> => ({
  _tag: 'left',
  __val: a,
  unwrap: () => ({
    tag: 'left',
    val: a
  }),
  map: _ => left<E>(a),
  leftMap: f => left(f(a)),
  biMap: (f, _) => left(f(a)),
  flatMap: _ => left<E>(a),
  fold: (f, _) => f(a)
})


const fromNullable = <R>(
  a: R | null | undefined
): Either<null, R> => (a === undefined || a === null ? left(null) : right(a))

export const either = {
  left,
  right,
  fromNullable
}
