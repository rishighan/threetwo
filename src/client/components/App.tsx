import * as React from "react";
import { hot } from "react-hot-loader";
import Dashboard from "./Dashboard";

import Import from "./Import";
import { ComicDetail } from "./ComicDetail";
import Library from "./Library";
import Search from "./Search";

import { Switch, Route } from "react-router";
import Navbar from "./Navbar";
import "../assets/scss/App.scss";

class App extends React.Component {
  public render() {
    return (
      <div>
        <Navbar />
        <Switch>
          <Route exact path="/">
            <Dashboard />
          </Route>
          <Route path="/import">
            <Import path={"./comics"} />
          </Route>
          <Route path="/library">
            <Library />
          </Route>
          <Route path="/search">
            <Search />
          </Route>
          <Route
            path={"/comic/details/:comicObjectId"}
            component={ComicDetail}
          />
        </Switch>
      </div>
    );
  }
}

declare let module: Record<string, unknown>;

export default hot(module)(App);
