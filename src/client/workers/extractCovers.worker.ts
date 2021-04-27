// const worker: DedicatedWorkerGlobalScope = self as any;

// worker.onmessage = ({ data }) => {
//   if (data instanceof Array) {
//     worker.postMessage(data.join(" ") + "!");
//   }
// };

import { expose } from "comlink";

class ExpensiveProcessor {
  _foo: string;
  /* ... async methods here ... */
  constructor() {
    this._foo = "rishi";
  }
}

expose(ExpensiveProcessor, self);
