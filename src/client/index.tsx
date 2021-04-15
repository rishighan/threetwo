import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import configureStore from "./store/index";
import App from "./components/App";

const store = configureStore({});
const rootEl = document.getElementById("root");

render(
  <Provider store={store}>
    <App history={history} />
  </Provider>,
  rootEl,
);
