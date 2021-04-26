import { exposeWorker } from "react-hooks-worker";

const fib = (i) => {
  return i * 9;
};

exposeWorker(fib);
