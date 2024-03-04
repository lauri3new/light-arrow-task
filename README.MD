<div align="center">
<img height="100" src="https://raw.githubusercontent.com/lauri3new/light-Task/master/Task1.png">
<h1 >Light-Task</h1>
</div>

<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/@light-Task/Task?color=g">
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/lauri3new/light-Task/Node.js%20CI">
</p>

## About

WIP

Light Arrow is a small zero dependencies library for type safe asynchronous programming in typescript. The library is based around the functional and composable Task data type. Tasks are data structures that describe asynchronous (and synchronous) operations that can succeed or fail and may have some dependencies.

Inspiration from the highly recommended book _functional programming in scala_ Manning, the scala libraries Cats, ZIO and http4s amongst others.

## Getting Started

Installation

```bash
npm install @light-Task/task
```

### Tasks

Tasks are data structures that describe asynchronous operations that can succeed with a result value R or fail with a value E that depends on some dependencies D. Practically many programs or parts of programs we write fit that description. For those familiar to functional programming, Tasks are a kind of ReaderTaskEither. Tasks have a discoverable 'fluent' chain-able API, similar to native Promises and Arrays. To see a list of the full API of an Task check out the 'Methods' table at the bottom of this page.

### Error handling

Typically errors are thrown from within promises to represent failure cases, however these are mixed with runtime errors. Neither of these types are tracked in the type signature. We have to inspect the particular promise to understand what errors may be thrown from it. Tasks use the [Either data type](Either.md) to enable centralised type safe error handling. By tracking the error type we can know from the type signature how our program might fail and cover all cases in the error handling function we pass to the run method (similiar to a catch at the end of a promise).

**Note**: in the examples below all of the types are inferred but are written out just for demonstration purposes.

```ts
const sendInvites: Task<Error | string, void[]> = ...

sendInvites.run(
  () => console.log('success'),
  (error: string | Error) => {
    if (typeof error === 'string') {
      console.log('err str ', error)
    } else {
      console.log('err ', error.message)
    }
  }
)
```

### Referential transparency

Tasks won't actually perform any operation until the run method is called, this means that Tasks have the nice property of being referentially transparent. This means we can refactor expressions involving Tasks, such as calling a function returning an Task, and replacing them with the value returned without changing the meaning of the program. As it turns out by representing all side effects in our program, whether they are asynchronous or synchronous and failable or non-failable, as Tasks we can maintain referential transparency throughout our program making it easier to reason about.

### Performance

Tasks are stack safe and perform similiarly to native promises under performance testing, but have all of the benefits listed above.

### Interoperability

There are a number of helper functions to convert existing types to Tasks, including basic values, functions, async functions. See these in the table Functions (create Tasks from other types) below. Familiar helper functions such as `all` and `race` are provided as Task equivalents to `Promise.all` and `Promise.race`.

### Composability

Tasks are highly composable through their various methods listed below. The `orElse` and `andThen` methods are also provided as functions that accept n number of Tasks, `orElse` can be used for 'horizontal' composition, such as building up the routes of a express App. Some more combinators are included such as `retry` and `repeat`.

### Cancellation

Tasks support cancellation. Cancellation behaviour can vary based on how the Task was created, Tasks created with `construct` when cancelled will cancel the ongoing operation and call the optionally specified tidy up function, its important to use `construct` over other ways of creating Tasks when this immediate cancellation is needed and/or if resources need to be tidied up (e.g. timeouts). Other Tasks will complete the current operation but cancel the remaining operations.
