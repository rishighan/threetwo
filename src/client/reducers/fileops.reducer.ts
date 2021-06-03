import {
  IMS_SOCKET_CONNECTION_CONNECTED,
  IMS_SOCKET_CONNECTION_DISCONNECTED,
  IMS_COMICBOOK_METADATA_FETCHED,
  IMS_SOCKET_ERROR,
  IMS_RAW_IMPORT_SUCCESSFUL,
  IMS_RAW_IMPORT_FAILED,
} from "../constants/action-types";
const initialState = {
  dataTransferred: false,
  comicBookMetadata: [],
  socketConnected: false,
  rawImportError: {},
};

function fileOpsReducer(state = initialState, action) {
  switch (action.type) {
    case IMS_COMICBOOK_METADATA_FETCHED:
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
        rawImportDetails: action.rawImportDetails,
      };
    case IMS_RAW_IMPORT_FAILED:
      return {
        ...state,
        rawImportErorr: action.rawImportError,
      };
    default:
      return state;
  }
}

export default fileOpsReducer;
