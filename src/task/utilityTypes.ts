import { Task } from "./index";

/**
 * Extract the result (Right) type of the given Arrow type.
 */
export type TasksResult<ARROW> = ARROW extends Task<any, infer R> ? R : never;

/**
 * Extract the error (Left) type of the given Arrow type.
 */
export type TasksError<ARROW> = ARROW extends Task<infer E, any> ? E : never;
