import { reject } from "../creators";
import { Task, construct, constructTask, resolve } from "../index";
import { Left, Right } from "../../either";
import { sleep } from "./helpers";

it("constructTask should map", async () => {
  const result = await constructTask<never, number>((res) => res(1))
    .map((a) => a * 3)
    .runAsPromiseResult();
  expect(result).toEqual(3);
});

it("constructTask should map - fail", async () => {
  const { error, result } = await constructTask<never, number>((res) => res(1))
    .flatMap(() => constructTask<number, never>((_, rej) => rej(1)))
    .map((a) => a * 3)
    .runAsPromise();
  expect(result).toEqual(1);
  expect(error).toEqual(1);
});

it("constructTask should flatMap", async () => {
  const result = await constructTask<never, number>((res) => res(1))
    .flatMap((a) => constructTask<never, number>((res) => res(a * 3)))
    .runAsPromiseResult();
  expect(result).toEqual(3);
});

it("constructTask should flatMap - fail", async () => {
  const { error, result } = await constructTask<number, never>((_, rej) =>
    rej(1)
  )
    .flatMap((a) => constructTask<never, number>((res) => res(a * 3)))
    .runAsPromise();
  expect(result).toEqual(undefined);
  expect(error).toEqual(1);
});

it("constructTask should leftMap", async () => {
  const { error } = await constructTask<number, never>((_, rej) => rej(1))
    .leftMap((a) => a * 3)
    .runAsPromise();
  expect(error).toEqual(3);
});

it("constructTask should biMap - right", async () => {
  const { error, result } = await constructTask<never, number>((res) => res(1))
    .biMap(
      (a) => a * 3,
      (a) => a * 5
    )
    .runAsPromise();
  expect(result).toEqual(5);
  expect(error).toEqual(undefined);
});

it("constructTask should biMap - left", async () => {
  const { error, result } = await constructTask<number, never>((_, rej) =>
    rej(1)
  )
    .biMap(
      (a) => a * 3,
      (a) => a * 5
    )
    .runAsPromise();
  expect(result).toEqual(undefined);
  expect(error).toEqual(3);
});

it("constructTask should group", async () => {
  const result = await constructTask<never, number>((res) => res(1))
    .group(constructTask<never, number>((res) => res(2)))
    .runAsPromiseResult();
  expect(result).toEqual([1, 2]);
});

it("constructTask should group - fail", async () => {
  const { result, error } = await constructTask<never, number>((res) => res(1))
    .group(constructTask<number, never>((_, rej) => rej(2)))
    .runAsPromise();
  expect(result).toEqual(1);
  expect(error).toEqual(2);
});

it("constructTask should group first", async () => {
  const result = await constructTask<never, number>((res) => res(1))
    .groupFirst(constructTask<never, number>((res) => res(2)))
    .runAsPromiseResult();
  expect(result).toEqual(1);
});

it("constructTask should group second", async () => {
  const result = await constructTask<never, number>((res) => res(1))
    .groupSecond(constructTask<never, number>((res) => res(2)))
    .runAsPromiseResult();
  expect(result).toEqual(2);
});

it("constructTask should group", async () => {
  const result = await constructTask<never, number>((res) => res(1))
    .group(constructTask<never, number>((res) => res(2)))
    .runAsPromiseResult();
  expect(result).toEqual([1, 2]);
});

it("constructTask should orElse", async () => {
  const result = await constructTask<number, never>((_, rej) => rej(1))
    .orElse(constructTask<never, number>((res) => res(2)))
    .runAsPromiseResult();
  expect(result).toEqual(2);
});

it("constructTask should orElse", async () => {
  const a = constructTask<number, never>((_, rej) => rej(1)).orElse(
    Task<number, never>(async () => Left(2))
  );

  const result = await a
    .orElse(constructTask<never, number>((res) => res(2)))
    .runAsPromiseResult();
  expect(result).toEqual(2);
});

it("constructTask should bracket", async () => {
  let flag = false;
  const a = constructTask<never, { ok: number }>((res) =>
    res({ ok: 123 })
  ).bracket((b) => {
    expect(flag).toEqual(false);
    flag = true;
    return resolve(null);
  })((c) => {
    expect(flag).toEqual(false);
    return resolve<{}>(10);
  });
  const { result } = await a.runAsPromise();
  expect(flag).toEqual(true);
  expect(result).toEqual(10);
});

it("constructTask should bracket - fail case", async () => {
  let flag = false;
  const a = constructTask<never, { ok: number }>((res) =>
    res({ ok: 123 })
  ).bracket((b) => {
    expect(flag).toEqual(false);
    flag = true;
    return resolve(null);
  })((c) => {
    expect(flag).toEqual(false);
    return reject(10);
  });
  const { result, error } = await a.runAsPromise();
  expect(flag).toEqual(true);
  expect(error).toEqual(10);
});

it("constructTask should run - success", async () => {
  const a = construct<never, number>(() => (res) => res(2));
  const result = await a.run(
    (result) => {
      expect(result).toEqual(2);
    },
    (error) => {},
    (failure) => {}
  );
});

it("constructTask should run - error", async () => {
  const a = construct<number, never>(() => (_, rej) => rej(2));
  const result = a.run(
    (result) => {},
    (error) => {
      expect(error).toEqual(2);
    },
    (failure) => {}
  );
});

it("constructTask should run - failure", async () => {
  const a = construct<any, never>(() => (_, rej) => {
    rej("boom");
  });
  const result = a.run(
    (result) => {},
    (error) => {},
    (failure) => {
      expect((failure as any)?.message).toEqual("boom");
    }
  );
});

it("constructTask should run - context", async () => {
  const a = construct<never, number>(() => (res) => res(2));
  const result = a.run(
    (result) => {
      expect(result).toEqual(2);
    },
    (error) => {},
    (failure) => {}
  );
});

it("constructTask should run no cancel", async () => {
  let res = 0;
  const a = construct<never, number>(() => (res) => {
    sleep(100).then(() => res(2));
  });
  const cancel = await a.run(
    (result) => {
      res = result;
      expect(result).toEqual(2);
    },
    (error) => {}
  );
  await sleep(200);
  expect(res).toEqual(2);
});

it("constructTask should run and cancel", async () => {
  let r = 0;
  const a = construct<never, number>(() => (res) => {
    sleep(100).then(() => {
      r = 2;
      res(r);
    });
  });
  const cancel = await a.run(
    (result) => {
      r = result;
    },
    (error) => {}
  );
  cancel();
  await sleep(200);
  expect(r).toEqual(0);
});

it("constructTask should run as promise result - success", async () => {
  const a = construct<never, number>(() => (res) => res(2));
  const result = await a.runAsPromiseResult();
  expect(result).toEqual(2);
});
