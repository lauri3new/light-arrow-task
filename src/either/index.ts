// interface

export interface Either<E, A> {
  _tag: string;
  __val: E | A;
  leftMap: <B>(f: (_: E) => B) => Either<B, A>;
  map: <B>(f: (_: A) => B) => Either<E, B>;
  biMap: <E2, B>(f: (_: E) => E2, g: (_: A) => B) => Either<E2, B>;
  flatMap: <EE, B>(f: (_: A) => Either<E | EE, B>) => Either<E | EE, B>;
  match: <B, C>(f: (_: E) => B, g: (_: A) => C) => B | C;
}

// type aliases

export type right<A> = Either<never, A>;
export type left<E> = Either<E, never>;

// implementations

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const right = <A, E = never>(a: A): Either<E, A> => ({
  _tag: "right",
  __val: a,
  map: (f) => right(f(a)),
  leftMap: (f) => right(a),
  biMap: (f, g) => right(g(a)),
  flatMap: (f) => f(a),
  match: (f, g) => g(a),
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const left = <E, A = never>(a: E): Either<E, A> => ({
  _tag: "left",
  __val: a,
  map: (_) => left<E>(a),
  leftMap: (f) => left(f(a)),
  biMap: (f, g) => left(f(a)),
  flatMap: (_) => left<E>(a),
  match: (f, g) => f(a),
});

const fromNullable = <R>(a: R | null | undefined): Either<null, R> =>
  a === undefined || a === null ? left(null) : right(a);

export const either = {
  right,
  left,
  fromNullable,
};
