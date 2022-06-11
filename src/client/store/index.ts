import { createStore, combineReducers, applyMiddleware } from "redux";
import { createHashHistory } from "history";
import { composeWithDevTools } from "@redux-devtools/extension";
import thunk from "redux-thunk";
import { createReduxHistoryContext } from "redux-first-history";
import { reducers } from "../reducers/index";

import { io } from "socket.io-client";
import socketIoMiddleware from "redux-socket.io-middleware";
import { SOCKET_BASE_URI } from "../constants/endpoints";
const socketConnection = io(SOCKET_BASE_URI, { transports: ["websocket"] });

const { createReduxHistory, routerMiddleware, routerReducer } =
  createReduxHistoryContext({
    history: createHashHistory(),
  });

export const store = createStore(
  combineReducers({
    router: routerReducer,
    ...reducers,
  }),
  composeWithDevTools(
    applyMiddleware(
      socketIoMiddleware(socketConnection),
      thunk,
      routerMiddleware,
    ),
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  ),
);
export const history = createReduxHistory(store);
