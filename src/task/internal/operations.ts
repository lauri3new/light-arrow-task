import { Either } from '../../either/index'
import { Task } from '../index'

export enum Ops {
  map = 1,
  flatMap = 2,
  leftMap = 3,
  andThen = 4,
  orElse = 5,
  group = 6,
  groupFirst = 7,
  groupSecond = 8,
  promiseBased = 9,
  all = 10,
  race = 11,
  bracket = 12,
  value = 13,
  construct = 14,
  leftFlatMap = 15,
  ifOrElse = 16,
}

type map = {
  _tag: Ops.map;
  f: (result: any) => any;
};

type leftMap = {
  _tag: Ops.leftMap;
  f: (error: any) => any;
};

type orElse = {
  _tag: Ops.orElse;
  f: Task<any, any> | (() => Promise<Either<any, any>>);
};

type ifOrElse = {
  _tag: Ops.ifOrElse;
  f: [(_: any) => boolean, Task<any, any>];
};

type andThen = {
  _tag: Ops.andThen;
  f: Task<any, any> | ((result: any) => Promise<Either<any, any>>);
};

type group = {
  _tag: Ops.group;
  f: Task<any, any> | (() => Promise<Either<any, any>>);
};

type groupFirst = {
  _tag: Ops.groupFirst;
  f: Task<any, any> | (() => Promise<Either<any, any>>);
};

type groupSecond = {
  _tag: Ops.groupSecond;
  f: Task<any, any> | (() => Promise<Either<any, any>>);
};

type flatMap = {
  _tag: Ops.flatMap;
  f: (
    result: any
  ) => Task<any, any> | ((result: any) => () => Promise<Either<any, any>>);
};

type promiseBased = {
  _tag: Ops.promiseBased;
  f: () => Promise<Either<any, any>>;
};

type all = {
  _tag: Ops.all;
  f: Task<any, any>[];
  concurrencyLimit?: number;
};

type race = {
  _tag: Ops.race;
  f: Task<any, any>[];
};

type bracket = {
  _tag: Ops.bracket;
  f: [(_: any) => Task<any, any>, (_: any) => Task<any, any>];
};

type value = {
  _tag: Ops.value;
  f: any;
};

type construct = {
  _tag: Ops.construct;
  f: () => (
    resolve: (_: any) => void,
    reject: (_: any) => void
  ) => void | (() => void);
};

type leftFlatMap = {
  _tag: Ops.leftFlatMap;
  f: (result: any) => Task<any, any>;
};

export type Operation =
  | map
  | leftMap
  | flatMap
  | orElse
  | group
  | andThen
  | groupFirst
  | groupSecond
  | promiseBased
  | all
  | race
  | bracket
  | value
  | construct
  | leftFlatMap
  | ifOrElse;

export type Runnable = promiseBased | construct;
