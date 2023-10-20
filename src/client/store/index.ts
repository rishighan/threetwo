import { createHashHistory } from "history";
import thunk from "redux-thunk";
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createReduxHistoryContext } from "redux-first-history";
import socketIoMiddleware from "redux-socket.io-middleware";
import socketIOMiddleware from "../shared/middleware/SocketIOMiddleware";
import socketIOConnectionInstance from "../shared/socket.io/instance";
import settingsReducer from "../reducers/settings.reducer";
import { settingsApi } from "../services/settings.api";

const customSocketIOMiddleware = socketIOMiddleware(socketIOConnectionInstance);

const { createReduxHistory, routerMiddleware, routerReducer } =
  createReduxHistoryContext({
    history: createHashHistory(),
  });

const rootReducer = (history) => ({
  settings: settingsReducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  router: routerReducer,
});

const preloadedState = {};
export const store = configureStore({
  middleware: [
    socketIoMiddleware(socketIOConnectionInstance),
    customSocketIOMiddleware,
    thunk,
    routerMiddleware,
    settingsApi.middleware,
  ],
  reducer: rootReducer(createHashHistory()),
  preloadedState,
});
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export const history = createReduxHistory(store);
