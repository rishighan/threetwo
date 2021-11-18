import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import configureStore, { history } from "./store/index";
import { SocketContext, airDCPPSocket } from "./context/AirDCPPSocket";
import App from "./components/App";
const store = configureStore({});
const rootEl = document.getElementById("root");

render(
  <SocketContext.Provider value={airDCPPSocket}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>
  </SocketContext.Provider>,
  rootEl,
);
