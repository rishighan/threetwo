import { isUndefined, map } from "lodash";
import { LOCATION_CHANGE } from "redux-first-history";
import { determineCoverFile } from "../shared/utils/metadata.utils";
import {
  IMS_COMICBOOK_METADATA_FETCHED,
  IMS_RAW_IMPORT_SUCCESSFUL,
  IMS_RAW_IMPORT_FAILED,
  IMS_RECENT_COMICS_FETCHED,
  IMS_WANTED_COMICS_FETCHED,
  WANTED_COMICS_FETCHED,
  IMS_CV_METADATA_IMPORT_SUCCESSFUL,
  IMS_CV_METADATA_IMPORT_FAILED,
  IMS_CV_METADATA_IMPORT_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_GROUPS_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_GROUPS_FETCHED,
  IMS_COMIC_BOOK_GROUPS_CALL_FAILED,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS,
  LS_IMPORT,
  LS_COVER_EXTRACTED,
  LS_COVER_EXTRACTION_FAILED,
  LS_COMIC_ADDED,
  IMG_ANALYSIS_CALL_IN_PROGRESS,
  IMG_ANALYSIS_DATA_FETCH_SUCCESS,
  SS_SEARCH_RESULTS_FETCHED,
  SS_SEARCH_IN_PROGRESS,
  FILEOPS_STATE_RESET,
  LS_IMPORT_CALL_IN_PROGRESS,
  SS_SEARCH_FAILED,
  SS_SEARCH_RESULTS_FETCHED_SPECIAL,
  VOLUMES_FETCHED,
  COMICBOOK_EXTRACTION_SUCCESS,
  LIBRARY_SERVICE_HEALTH,
  LS_IMPORT_QUEUE_DRAINED,
  LS_SET_QUEUE_STATUS,
  RESTORE_JOB_COUNTS_AFTER_SESSION_RESTORATION,
  LS_IMPORT_JOB_STATISTICS_FETCHED,
} from "../constants/action-types";
import { removeLeadingPeriod } from "../shared/utils/formatting.utils";
import { LIBRARY_SERVICE_HOST } from "../constants/endpoints";

const initialState = {
  IMSCallInProgress: false,
  IMGCallInProgress: false,
  SSCallInProgress: false,
  imageAnalysisResults: {},
  comicBookExtractionInProgress: false,
  LSQueueImportStatus: undefined,
  comicBookMetadata: [],
  comicVolumeGroups: [],
  isSocketConnected: false,
  isComicVineMetadataImportInProgress: false,
  comicVineMetadataImportError: {},
  rawImportError: {},
  extractedComicBookArchive: {
    reading: [],
    analysis: [],
  },
  recentComics: [],
  wantedComics: [],
  libraryComics: [],
  volumes: [],
  librarySearchResultsFormatted: [],
  lastQueueJob: "",
  successfulJobCount: 0,
  failedJobCount: 0,
  importJobStatistics: [],
  libraryQueueResults: [],
  librarySearchError: {},
  libraryServiceStatus: {},
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
        recentComics: action.data.docs,
      };
    case IMS_WANTED_COMICS_FETCHED:
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

    case LOCATION_CHANGE: {
      return {
        ...state,
        extractedComicBookArchive: [],
      };
    }

    case LS_IMPORT: {
      return {
        ...state,
        LSQueueImportStatus: "running",
      };
    }

    case LS_COVER_EXTRACTED: {
      if (state.recentComics.length === 5) {
        state.recentComics.pop();
      }
      return {
        ...state,
        successfulJobCount: action.completedJobCount,
        lastQueueJob: action.importResult.rawFileDetails.name,
        recentComics: [...state.recentComics, action.importResult],
      };
    }

    case LS_COVER_EXTRACTION_FAILED: {
      return {
        ...state,
        failedJobCount: action.failedJobCount,
      };
    }

    case LS_IMPORT_QUEUE_DRAINED: {
      localStorage.removeItem("sessionId");
      return {
        ...state,
        LSQueueImportStatus: "drained",
      };
    }

    case RESTORE_JOB_COUNTS_AFTER_SESSION_RESTORATION: {
      console.log("Restoring state for an active import in progress...");
      return {
        ...state,
        successfulJobCount: action.completedJobCount,
        failedJobCount: action.failedJobCount,
        LSQueueImportStatus: action.queueStatus,
      };
    }

    case LS_SET_QUEUE_STATUS: {
      return {
        ...state,
        LSQueueImportStatus: action.data.queueStatus,
      };
    }

    case LS_IMPORT_JOB_STATISTICS_FETCHED: {
      return {
        ...state,
        importJobStatistics: action.data,
      };
    }

    case COMICBOOK_EXTRACTION_SUCCESS: {
      const comicBookPages: string[] = [];
      map(action.result.files, (page) => {
        const pageFilePath = removeLeadingPeriod(page);
        const imagePath = encodeURI(`${LIBRARY_SERVICE_HOST}${pageFilePath}`);
        comicBookPages.push(imagePath);
      });

      switch (action.result.purpose) {
        case "reading":
          return {
            ...state,
            extractedComicBookArchive: {
              reading: comicBookPages,
            },
            comicBookExtractionInProgress: false,
          };

        case "analysis":
          return {
            ...state,
            extractedComicBookArchive: {
              analysis: comicBookPages,
            },
            comicBookExtractionInProgress: false,
          };
      }
    }

    case LS_COMIC_ADDED: {
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
      return {
        ...state,
        libraryComics: action.data,
        SSCallInProgress: false,
      };
    }
    case SS_SEARCH_RESULTS_FETCHED_SPECIAL: {
      const foo = [];
      if (!isUndefined(action.data.hits)) {
        map(action.data.hits, ({ _source }) => {
          foo.push(_source);
        });
      }
      return {
        ...state,
        librarySearchResultsFormatted: foo,
        SSCallInProgress: false,
      };
    }
    case WANTED_COMICS_FETCHED: {
      const foo = [];
      if (!isUndefined(action.data.hits)) {
        map(action.data.hits, ({ _source }) => {
          foo.push(_source);
        });
      }
      return {
        ...state,
        wantedComics: foo,
        SSCallInProgress: false,
      };
    }

    case VOLUMES_FETCHED:
      return {
        ...state,
        volumes: action.data,
        SSCallInProgress: false,
      };

    case SS_SEARCH_FAILED: {
      return {
        ...state,
        librarySearchError: action.data,
        SSCallInProgress: false,
      };
    }
    case LIBRARY_SERVICE_HEALTH: {
      return {
        ...state,
        libraryServiceStatus: action.status,
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
