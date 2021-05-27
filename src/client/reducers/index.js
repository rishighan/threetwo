import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import comicinfoReducer from "../reducers/comicinfo.reducer";
import fileOpsReducer from "../reducers/fileops.reducer";

export default (history) =>
  combineReducers({
    comicInfo: comicinfoReducer,
    fileOps: fileOpsReducer,
    router: connectRouter(history),
  });
