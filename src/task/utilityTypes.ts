import { Task } from "./index";

/**
 * Extract the result (right) type of the given Arrow type.
 */
export type TasksResult<ARROW> = ARROW extends Task<any, infer R> ? R : never;

/**
 * Extract the error (left) type of the given Arrow type.
 */
export type TasksError<ARROW> = ARROW extends Task<infer E, any> ? E : never;
