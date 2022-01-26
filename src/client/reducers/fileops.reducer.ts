import { LOCATION_CHANGE } from "connected-react-router";
import {
  RMQ_SOCKET_CONNECTED,
  IMS_COMICBOOK_METADATA_FETCHED,
  IMS_RAW_IMPORT_SUCCESSFUL,
  IMS_RAW_IMPORT_FAILED,
  IMS_RECENT_COMICS_FETCHED,
  IMS_DATA_FETCH_ERROR,
  IMS_CV_METADATA_IMPORT_SUCCESSFUL,
  IMS_CV_METADATA_IMPORT_FAILED,
  IMS_CV_METADATA_IMPORT_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_GROUPS_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_GROUPS_FETCHED,
  IMS_COMIC_BOOK_GROUPS_CALL_FAILED,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_SUCCESS,
  LS_IMPORT,
  LS_COVER_EXTRACTED,
  LS_COMIC_ADDED,
} from "../constants/action-types";
const initialState = {
  IMSCallInProgress: false,
  comicBookExtractionInProgress: false,
  comicBookMetadata: [],
  comicVolumeGroups: [],
  isSocketConnected: false,
  isComicVineMetadataImportInProgress: false,
  comicVineMetadataImportError: {},
  rawImportError: {},
  extractedComicBookArchive: [],
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
    case IMS_COMIC_BOOK_GROUPS_CALL_IN_PROGRESS: {
      return {
        ...state,
        IMSCallInProgress: true,
      };
    }
    case IMS_COMIC_BOOK_GROUPS_FETCHED: {
      return {
        ...state,
        comicVolumeGroups: action.data,
        IMSCallInProgress: false,
      };
    }
    case IMS_COMIC_BOOK_GROUPS_CALL_FAILED: {
      return {
        ...state,
        IMSCallInProgress: false,
        error: action.error,
      };
    }
    case IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS: {
      return {
        ...state,
        comicBookExtractionInProgress: true,
      };
    }
    case IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_SUCCESS: {
      return {
        ...state,
        extractedComicBookArchive: action.extractedComicBookArchive,
        comicBookExtractionInProgress: false,
      };
    }
    case LOCATION_CHANGE: {
      return {
        ...state,
        extractedComicBookArchive: [],
      };
    }

    case LS_IMPORT: {
      return {
        ...state,
      };
    }
    case LS_COVER_EXTRACTED: {
      console.log("BASH", action);
      return {
        ...state,
      };
    }
    case LS_COMIC_ADDED: {
      console.log("ADDED na anna", action);
      return {
        ...state,
      };
    }
    default:
      return state;
  }
}

export default fileOpsReducer;
