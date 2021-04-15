import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import comicinfoReducer from "../reducers/comicinfo.reducer";

export default (history) =>
  combineReducers({
    comicInfo: comicinfoReducer,
    router: connectRouter(history),
  });
