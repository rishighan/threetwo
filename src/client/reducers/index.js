import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import comicinfoReducer from "../reducers/comicinfo.reducer";
import fileOpsReducer from "../reducers/fileops.reducer";
import airdcppReducer from "../reducers/airdcpp.reducer";
import { reducer as notifications } from "react-notification-system-redux";

export default (history) =>
  combineReducers({
    notifications,
    comicInfo: comicinfoReducer,
    fileOps: fileOpsReducer,
    airdcpp: airdcppReducer,
    router: connectRouter(history),
  });
