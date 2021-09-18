import React, { ReactElement } from "react";
import { useSelector } from "react-redux";
import { hot } from "react-hot-loader";
import Dashboard from "./Dashboard";

import Import from "./Import";
import { ComicDetail } from "./ComicDetail";
import Library from "./Library";
import Search from "./Search";
import Settings from "./Settings";

import { Switch, Route } from "react-router";
import Navbar from "./Navbar";
import "../assets/scss/App.scss";
import Notifications from "react-notification-system-redux";

//Optional styling
const style = {
  Containers: {
    DefaultStyle: {
      fontFamily: "inherit",
      position: "fixed",
      padding: "0 10px 10px 10px",
      zIndex: 9998,
      WebkitBoxSizing: "border-box",
      MozBoxSizing: "border-box",
      boxSizing: "border-box",
      height: "auto",
    },
    tr: {
      top: "40px",
      right: "10px",
    },
  },
  Title: {
    DefaultStyle: {
      fontSize: "14px",
      margin: "0 0 5px 0",
      padding: 0,
      fontWeight: "bold",
    },

    success: {
      color: "hsl(141, 71%, 48%)",
    },
  },
  NotificationItem: {
    // Override the notification item
    success: {
      // Applied to every notification, regardless of the notification level
      borderTop: "none",
      backgroundColor: "#FFF",
      borderRadius: "0.4rem",
      WebkitBoxShadow: "-7px 11px 25px -9px rgba(0, 0, 0, 0.3)",
      MozBoxShadow: "-7px 11px 25px -9px rgba(0, 0, 0, 0.3)",
      boxShadow: "-7px 11px 25px -9px rgba(0, 0, 0, 0.3)",
    },
  },
};
export const App = (): ReactElement => {
  const notifications = useSelector((state: RootState) => state.notifications);
  return (
    <div>
      <Navbar />
      <Notifications
        notifications={notifications}
        style={style}
        newOnTop={true}
        allowHTML={true}
      />
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
        <Route path={"/comic/details/:comicObjectId"} component={ComicDetail} />
        <Route path="/settings">
          <Settings />
        </Route>
      </Switch>
    </div>
  );
};

export default hot(module)(App);
