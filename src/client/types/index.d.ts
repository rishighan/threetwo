declare module "*.png" {
  const value: string;
  export = value;
}
declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module "*.jpg";
declare module "*.gif";
declare module "*.less";
