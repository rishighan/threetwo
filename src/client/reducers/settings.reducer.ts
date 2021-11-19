import {
  SETTINGS_CALL_FAILED,
  SETTINGS_OBJECT_FETCHED,
  SETTINGS_OBJECT_DELETED,
  SETTINGS_CALL_IN_PROGRESS,
} from "../constants/action-types";
const initialState = {
  data: {},
  inProgress: false,
};

function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case SETTINGS_CALL_IN_PROGRESS:
      return {
        ...state,
        inProgress: true,
      };

    case SETTINGS_OBJECT_FETCHED:
      return {
        ...state,
        data: action.data,
        inProgress: false,
      };

    case SETTINGS_OBJECT_DELETED:
      return {
        ...state,
        data: action.data,
        inProgress: false,
      };

    default:
      return { ...state };
  }
}

export default settingsReducer;
