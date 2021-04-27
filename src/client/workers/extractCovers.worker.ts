import strategy from "clooney";

class Actor {
  timeoutThing() {
    return new Promise(resolve => setTimeout(_ => resolve('ohai'), 1000));
  }
}

const instance = await strategy.spawn(Actor);
alert(await instance.timeoutThing()); // Will alert() after 1 second
