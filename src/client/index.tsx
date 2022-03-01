import React from "react";
import { render } from "react-dom";
import { Provider, connect } from "react-redux";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { store, history } from "./store/index";
import App from "./components/App";

const rootEl = document.getElementById("root");

render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  rootEl,
);
