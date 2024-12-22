/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructable<T = any, A extends any[] = any> = new (
  ...args: A
) => T
