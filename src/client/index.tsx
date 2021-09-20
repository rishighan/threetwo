import * as React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import WebSocketProvider, {
  WebSocketContext,
} from "./context/socket/socket.context";
import configureStore, { history } from "./store/index";
import App from "./components/App";
const store = configureStore({});
const rootEl = document.getElementById("root");

render(
  <Provider store={store}>
    <WebSocketProvider>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </WebSocketProvider>
  </Provider>,
  rootEl,
);
