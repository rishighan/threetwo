import comicinfoReducer from "../reducers/comicinfo.reducer";
import fileOpsReducer from "../reducers/fileops.reducer";
import airdcppReducer from "../reducers/airdcpp.reducer";
import settingsReducer from "../reducers/settings.reducer";
import { reducer as notifications } from "react-notification-system-redux";

export const reducers = {
  notifications,
  comicInfo: comicinfoReducer,
  fileOps: fileOpsReducer,
  airdcpp: airdcppReducer,
  settings: settingsReducer,
};
