import {
  IMS_SOCKET_CONNECTION_CONNECTED,
  IMS_SOCKET_CONNECTION_DISCONNECTED,
  IMS_SOCKET_DATA_FETCHED,
  IMS_SOCKET_ERROR,
  IMS_RAW_IMPORT_SUCCESSFUL,
} from "../constants/action-types";
const initialState = {
  dataTransferred: false,
  comicBookMetadata: [],
  socketConnected: false,
  rawImportCompleted: {},
};

function fileOpsReducer(state = initialState, action) {
  switch (action.type) {
    case IMS_SOCKET_DATA_FETCHED:
      return {
        ...state,
        comicBookMetadata: [...state.comicBookMetadata, action.data],
        dataTransferred: true,
      };

    case IMS_SOCKET_CONNECTION_CONNECTED:
      return {
        ...state,
        socketConnected: action.socketConnected,
      };
    case IMS_RAW_IMPORT_SUCCESSFUL:
      return {
        ...state,
        rawImportCompleted: action.rawImportCompleted,
      };
    default:
      return state;
  }
}

export default fileOpsReducer;
