import { expose } from "comlink";

const foo = (value: string) => {
  return "rishi" + " " + value;
};

const bar = (value: number) => {
  return value + 10;
};

const exported = {
  foo,
  bar,
};

export type Worker = typeof exported;
expose(exported);
