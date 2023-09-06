import {
  SETTINGS_CALL_FAILED,
  SETTINGS_OBJECT_FETCHED,
  SETTINGS_OBJECT_DELETED,
  SETTINGS_CALL_IN_PROGRESS,
  SETTINGS_DB_FLUSH_SUCCESS,
  SETTINGS_QBITTORRENT_TORRENTS_LIST_FETCHED,
} from "../constants/action-types";
const initialState = {
  data: {},
  inProgress: false,
  DbFlushed: false,
  torrentsList: [],
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

    case SETTINGS_DB_FLUSH_SUCCESS:
      console.log(state);
      return {
        ...state,
        DbFlushed: action.data,
        inProgress: false,
      };
      
    case SETTINGS_QBITTORRENT_TORRENTS_LIST_FETCHED:
      return {
        ...state,
        torrentsList: action.data,
      }

    default:
      return { ...state };
  }
}

export default settingsReducer;
