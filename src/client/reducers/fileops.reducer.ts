import { LOCATION_CHANGE } from "redux-first-history";
import {
  IMS_COMICBOOK_METADATA_FETCHED,
  IMS_RAW_IMPORT_SUCCESSFUL,
  IMS_RAW_IMPORT_FAILED,
  IMS_RECENT_COMICS_FETCHED,
  IMS_WANTED_COMICS_FETCHED,
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
  LS_QUEUE_DRAINED,
  LS_COMIC_ADDED,
  IMG_ANALYSIS_CALL_IN_PROGRESS,
  IMG_ANALYSIS_DATA_FETCH_SUCCESS,
  SS_SEARCH_RESULTS_FETCHED,
  SS_SEARCH_IN_PROGRESS,
  FILEOPS_STATE_RESET,
  LS_IMPORT_CALL_IN_PROGRESS,
  SS_SEARCH_FAILED,
} from "../constants/action-types";
const initialState = {
  IMSCallInProgress: false,
  IMGCallInProgress: false,
  SSCallInProgress: false,
  imageAnalysisResults: {},
  comicBookExtractionInProgress: false,
  comicBookMetadata: [],
  comicVolumeGroups: [],
  isSocketConnected: false,
  isComicVineMetadataImportInProgress: false,
  comicVineMetadataImportError: {},
  rawImportError: {},
  extractedComicBookArchive: [],
  recentComics: [],
  wantedComics: [],
  librarySearchResults: [],
  librarySearchResultCount: 0,
  libraryQueueResults: [],
  librarySearchError: {},
};

function fileOpsReducer(state = initialState, action) {
  switch (action.type) {
    case IMS_COMICBOOK_METADATA_FETCHED:
      return {
        ...state,
        comicBookMetadata: [...state.comicBookMetadata, action.data],
        IMSCallInProgress: false,
      };

    case LS_IMPORT_CALL_IN_PROGRESS: {
      return {
        ...state,
        IMSCallInProgress: true,
      };
    }
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
    case IMS_WANTED_COMICS_FETCHED:
      console.log(action.data);
      return {
        ...state,
        wantedComics: action.data,
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
        librarySearchResultCount: state.librarySearchResultCount + 1,
      };
    }
    case LS_QUEUE_DRAINED: {
      console.log("drained", action);
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
    case IMG_ANALYSIS_CALL_IN_PROGRESS: {
      return {
        ...state,
        IMGCallInProgress: true,
      };
    }
    case IMG_ANALYSIS_DATA_FETCH_SUCCESS: {
      return {
        ...state,
        imageAnalysisResults: action.result,
      };
    }

    case SS_SEARCH_IN_PROGRESS: {
      return {
        ...state,
        SSCallInProgress: true,
      };
    }

    case SS_SEARCH_RESULTS_FETCHED: {
      console.log(action.data);
      return {
        ...state,
        librarySearchResults: action.data,
        SSCallInProgress: false,
      };
    }
    case SS_SEARCH_FAILED: {
      console.log(action.data);
      return {
        ...state,
        librarySearchError: action.data,
        SSCallInProgress: false,
      };
    }

    case FILEOPS_STATE_RESET: {
      return {
        ...state,
        imageAnalysisResults: {},
      };
    }
    default:
      return state;
  }
}

export default fileOpsReducer;
