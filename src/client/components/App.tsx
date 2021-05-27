import * as React from "react";
import { hot } from "react-hot-loader";
import Dashboard from "./Dashboard";
import Import from "./Import";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Navbar from "./Navbar";
import "../assets/scss/App.scss";

class App extends React.Component<Record<string, unknown>, undefined> {
  public render() {
    return (
      <div>
        <Router>
          <Navbar />
          <Switch>
            <Route exact path="/">
              <Dashboard />
            </Route>
            <Route path="/import">
              <Import path={"./comics"} />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

declare let module: Record<string, unknown>;

export default hot(module)(App);
