import { routerMiddleware } from "connected-react-router";
import { createStore, applyMiddleware, compose } from "redux";
import { createBrowserHistory } from "history";
import thunk from "redux-thunk";
import createRootReducer from "../reducers";

export const history = createBrowserHistory();
export default function configureStore(initialState) {
  const store = createStore(
    createRootReducer(history),
    initialState,
    compose(
      applyMiddleware(thunk, routerMiddleware(history)),
      // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    ),
  );
  return store;
}
