import {
  RMQ_SOCKET_CONNECTED,
  RMQ_SOCKET_DISCONNECTED,
  IMS_COMICBOOK_METADATA_FETCHED,
  RMQ_SOCKET_ERROR,
  IMS_RAW_IMPORT_SUCCESSFUL,
  IMS_RAW_IMPORT_FAILED,
  IMS_RECENT_COMICS_FETCHED,
  IMS_DATA_FETCH_ERROR,
  IMS_CV_METADATA_IMPORT_SUCCESSFUL,
  IMS_CV_METADATA_IMPORT_FAILED,
  IMS_CV_METADATA_IMPORT_CALL_IN_PROGRESS,
} from "../constants/action-types";
const initialState = {
  IMSCallInProgress: false,
  comicBookMetadata: [],
  isSocketConnected: false,
  isComicVineMetadataImportInProgress: false,
  comicVineMetadataImportError: {},
  rawImportError: {},
};

function fileOpsReducer(state = initialState, action) {
  switch (action.type) {
    case IMS_COMICBOOK_METADATA_FETCHED:
      return {
        ...state,
        comicBookMetadata: [...state.comicBookMetadata, action.data],
        IMSCallInProgress: false,
      };

    case RMQ_SOCKET_CONNECTED:
      return {
        ...state,
        isSocketConnected: action.isSocketConnected,
        socketId: action.socketId,
        IMSCallInProgress: true,
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
    case IMS_RECENT_COMICS_FETCHED:
      return {
        ...state,
        recentComics: action.data,
      };
    case IMS_CV_METADATA_IMPORT_SUCCESSFUL:
      return {
        ...state,
        isComicVineMetadataImportInProgress: false,
        comicVineMetadataImportDetails: action.importResult,
      };
    case IMS_CV_METADATA_IMPORT_CALL_IN_PROGRESS:
      return {
        ...state,
        isComicVineMetadataImportInProgress: true,
      };
    case IMS_CV_METADATA_IMPORT_FAILED:
      return {
        ...state,
        isComicVineMetadataImportInProgress: false,
        comicVineMetadataImportError: action.importError,
      };
    default:
      return state;
  }
}

export default fileOpsReducer;
