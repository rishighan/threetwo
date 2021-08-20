import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import comicinfoReducer from "../reducers/comicinfo.reducer";
import fileOpsReducer from "../reducers/fileops.reducer";
import airdcppReducer from "./airdcpp.reducer";

export default (history) =>
  combineReducers({
    comicInfo: comicinfoReducer,
    fileOps: fileOpsReducer,
    acquisition: {
      airdcpp: airdcppReducer,
    },
    router: connectRouter(history),
  });
