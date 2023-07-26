import { createStore, combineReducers, applyMiddleware } from "redux";
import { createHashHistory } from "history";
import { composeWithDevTools } from "@redux-devtools/extension";
import thunk from "redux-thunk";
import { createReduxHistoryContext } from "redux-first-history";
import { reducers } from "../reducers/index";
import socketIoMiddleware from "redux-socket.io-middleware";
import socketIOMiddleware from "../shared/middleware/SocketIOMiddleware";
import socketIOConnectionInstance from "../shared/socket.io/instance";

const customSocketIOMiddleware = socketIOMiddleware(socketIOConnectionInstance);

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
      socketIoMiddleware(socketIOConnectionInstance),
      customSocketIOMiddleware,
      thunk,
      routerMiddleware,
    ),
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  ),
);
export const history = createReduxHistory(store);
