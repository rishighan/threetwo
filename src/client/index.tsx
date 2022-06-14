import React from "react";
import { render } from "react-dom";
import { Provider, connect } from "react-redux";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { store, history } from "./store/index";
import { createRoot } from "react-dom/client";
import App from "./components/App";

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
//In the entry of your indirect code path (e.g. some index.js), add the following two lines:

root.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
);
