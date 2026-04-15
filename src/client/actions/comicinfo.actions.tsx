/**
 * @fileoverview Redux action creators for ComicVine API and comic book information.
 * Provides actions for searching ComicVine, fetching comic metadata, managing
 * library statistics, and applying ComicVine matches to local comic records.
 * @module actions/comicinfo
 */

import axios from "axios";
import rateLimiter from "axios-rate-limit";
import { setupCache } from "axios-cache-interceptor";
import {
  CV_SEARCH_SUCCESS,
  CV_API_CALL_IN_PROGRESS,
  CV_API_GENERIC_FAILURE,
  IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
  CV_ISSUES_METADATA_CALL_IN_PROGRESS,
  CV_CLEANUP,
  IMS_COMIC_BOOKS_DB_OBJECTS_FETCHED,
  CV_ISSUES_MATCHES_IN_LIBRARY_FETCHED,
  CV_ISSUES_FOR_VOLUME_IN_LIBRARY_SUCCESS,
  CV_WEEKLY_PULLLIST_CALL_IN_PROGRESS,
  CV_WEEKLY_PULLLIST_FETCHED,
  LIBRARY_STATISTICS_CALL_IN_PROGRESS,
  LIBRARY_STATISTICS_FETCHED,
} from "../constants/action-types";
import {
  COMICVINE_SERVICE_URI,
  LIBRARY_SERVICE_BASE_URI,
} from "../constants/endpoints";
import type { Dispatch } from "react";

/** Redux action type for comic info actions */
interface ComicInfoAction {
  type: string;
  data?: unknown;
  inProgress?: boolean;
  searchResults?: unknown;
  error?: unknown;
  issues?: unknown[];
  matches?: unknown;
  comicBookDetail?: unknown;
  comicBooks?: unknown[];
  IMS_inProgress?: boolean;
}

/** Options for the weekly pull list */
interface PullListOptions {
  [key: string]: unknown;
}

/** Options for the comicinfo API call */
interface ComicInfoAPIOptions {
  callURIAction: string;
  callMethod: string;
  callParams: Record<string, unknown>;
  data?: unknown;
}

/** Issue type from ComicVine */
interface ComicVineIssue {
  id: string;
  name: string;
  issue_number: string;
  volume: {
    name: string;
  };
}

/** Match object for ComicVine metadata */
interface ComicVineMatch {
  [key: string]: unknown;
}

/** Thunk dispatch type */
type ThunkDispatch = Dispatch<ComicInfoAction>;

/**
 * Rate-limited axios instance for ComicVine API calls.
 * Limited to 1 request per second to comply with API rate limits.
 * @constant {AxiosInstance}
 */
const http = rateLimiter(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
  maxRPS: 1,
});

/**
 * Cached axios instance for reducing redundant API calls.
 * @constant {AxiosInstance}
 */
const cachedAxios = setupCache(axios);

/**
 * Redux thunk action creator to fetch the weekly comic pull list.
 * Retrieves upcoming comic releases from the ComicVine service.
 *
 * @param {Object} options - Query parameters for the pull list request
 * @returns {Function} Redux thunk function that dispatches CV_WEEKLY_PULLLIST_FETCHED
 */
export const getWeeklyPullList = (options: PullListOptions) => async (dispatch: ThunkDispatch) => {
  try {
    dispatch({
      type: CV_WEEKLY_PULLLIST_CALL_IN_PROGRESS,
    });
    await cachedAxios(`${COMICVINE_SERVICE_URI}/getWeeklyPullList`, {
      method: "get",
      params: options,
    }).then((response) => {
      dispatch({
        type: CV_WEEKLY_PULLLIST_FETCHED,
        data: response.data.result,
      });
    });
  } catch (error) {
    // Error handling could be added here if needed
  }
};

/**
 * Generic Redux thunk action creator for ComicVine API calls.
 * Handles rate-limited requests to the ComicVine service with configurable
 * endpoints, methods, and parameters.
 *
 * @param {Object} options - API call configuration options
 * @param {string} options.callURIAction - API endpoint action (e.g., "search")
 * @param {string} options.callMethod - HTTP method (GET, POST, etc.)
 * @param {Object} options.callParams - Query parameters for the request
 * @param {any} [options.data] - Request body data
 * @returns {Function} Redux thunk function that dispatches appropriate action based on callURIAction
 */
export const comicinfoAPICall = (options: ComicInfoAPIOptions) => async (dispatch: ThunkDispatch) => {
  try {
    dispatch({
      type: CV_API_CALL_IN_PROGRESS,
      inProgress: true,
    });
    const serviceURI = `${COMICVINE_SERVICE_URI}/${options.callURIAction}`;
    const response = await http(serviceURI, {
      method: options.callMethod,
      params: options.callParams,
      data: options.data ? options.data : null,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    switch (options.callURIAction) {
      case "search":
        dispatch({
          type: CV_SEARCH_SUCCESS,
          searchResults: response.data,
        });
        break;

      default:
        break;
    }
  } catch (error) {
    dispatch({
      type: CV_API_GENERIC_FAILURE,
      error,
    });
  }
};

/**
 * Redux thunk action creator to fetch all issues for a comic series.
 * Retrieves issue list from ComicVine for a given volume/series.
 *
 * @param {string} comicObjectID - ComicVine volume/series ID
 * @returns {Function} Redux thunk function that dispatches CV_ISSUES_FOR_VOLUME_IN_LIBRARY_SUCCESS
 */
export const getIssuesForSeries =
  (comicObjectID: string) => async (dispatch: ThunkDispatch) => {
    dispatch({
      type: CV_ISSUES_METADATA_CALL_IN_PROGRESS,
    });
    dispatch({
      type: CV_CLEANUP,
    });

    const issues = await axios({
      url: `${COMICVINE_SERVICE_URI}/getIssuesForSeries`,
      method: "POST",
      params: {
        comicObjectID,
      },
    });
    dispatch({
      type: CV_ISSUES_FOR_VOLUME_IN_LIBRARY_SUCCESS,
      issues: issues.data.results,
    });
  };

/**
 * Redux thunk action creator to analyze library issues against ComicVine data.
 * Maps issues to query objects and finds matching issues in the local library.
 *
 * @param {Array} issues - Array of ComicVine issue objects to analyze
 * @param {string} issues[].id - Issue ID
 * @param {string} issues[].name - Issue name
 * @param {string} issues[].issue_number - Issue number
 * @param {Object} issues[].volume - Volume information
 * @param {string} issues[].volume.name - Volume name
 * @returns {Function} Redux thunk function that dispatches CV_ISSUES_MATCHES_IN_LIBRARY_FETCHED
 */
export const analyzeLibrary = (issues: ComicVineIssue[]) => async (dispatch: ThunkDispatch) => {
  dispatch({
    type: CV_ISSUES_METADATA_CALL_IN_PROGRESS,
  });
  const queryObjects = issues.map((issue: ComicVineIssue) => {
    const { id, name, issue_number } = issue;
    return {
      issueId: id,
      issueName: name,
      volumeName: issue.volume.name,
      issueNumber: issue_number,
    };
  });
  const foo = await axios({
    url: `${LIBRARY_SERVICE_BASE_URI}/findIssueForSeries`,
    method: "POST",
    data: {
      queryObjects,
    },
  });
  
  dispatch({
    type: CV_ISSUES_MATCHES_IN_LIBRARY_FETCHED,
    matches: foo.data,
  });
};

/**
 * Redux thunk action creator to fetch library statistics.
 * Retrieves aggregate statistics about the comic library.
 *
 * @returns {Function} Redux thunk function that dispatches LIBRARY_STATISTICS_FETCHED
 */
export const getLibraryStatistics = () => async (dispatch: ThunkDispatch) => {
  dispatch({
    type: LIBRARY_STATISTICS_CALL_IN_PROGRESS,
  });
  const result = await axios({
    url: `${LIBRARY_SERVICE_BASE_URI}/libraryStatistics`,
    method: "GET",
  });

  dispatch({
    type: LIBRARY_STATISTICS_FETCHED,
    data: result.data,
  });
};

/**
 * Redux thunk action creator to fetch detailed comic book information.
 * Retrieves full comic book document from the library database by ID.
 *
 * @param {string} comicBookObjectId - Database ID of the comic book
 * @returns {Function} Redux thunk function that dispatches IMS_COMIC_BOOK_DB_OBJECT_FETCHED
 */
export const getComicBookDetailById =
  (comicBookObjectId: string) => async (dispatch: ThunkDispatch) => {
    dispatch({
      type: IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
      IMS_inProgress: true,
    });
    const result = await axios.request({
      url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookById`,
      method: "POST",
      data: {
        id: comicBookObjectId,
      },
    });
    dispatch({
      type: IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
      comicBookDetail: result.data,
      IMS_inProgress: false,
    });
  };

/**
 * Redux thunk action creator to fetch multiple comic books by their IDs.
 * Retrieves full comic book documents from the library database for a list of IDs.
 *
 * @param {Array<string>} comicBookObjectIds - Array of database IDs
 * @returns {Function} Redux thunk function that dispatches IMS_COMIC_BOOKS_DB_OBJECTS_FETCHED
 */
export const getComicBooksDetailsByIds =
  (comicBookObjectIds: Array<string>) => async (dispatch: ThunkDispatch) => {
    dispatch({
      type: IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
      IMS_inProgress: true,
    });
    const result = await axios.request({
      url: `${LIBRARY_SERVICE_BASE_URI}/getComicBooksByIds`,
      method: "POST",
      data: {
        ids: comicBookObjectIds,
      },
    });
    dispatch({
      type: IMS_COMIC_BOOKS_DB_OBJECTS_FETCHED,
      comicBooks: result.data,
    });
  };

/**
 * Redux thunk action creator to apply ComicVine metadata to a local comic.
 * Associates a ComicVine match with a comic book record in the database,
 * updating the comic with metadata from ComicVine.
 *
 * @param {Object} match - ComicVine match object containing metadata to apply
 * @param {string} comicObjectId - Database ID of the local comic book to update
 * @returns {Function} Redux thunk function that dispatches IMS_COMIC_BOOK_DB_OBJECT_FETCHED
 */
export const applyComicVineMatch =
  (match: ComicVineMatch, comicObjectId: string) => async (dispatch: ThunkDispatch) => {
    dispatch({
      type: IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
      IMS_inProgress: true,
    });
    const result = await axios.request({
      url: `${LIBRARY_SERVICE_BASE_URI}/applyComicVineMetadata`,
      method: "POST",
      data: {
        match,
        comicObjectId,
      },
    });
    dispatch({
      type: IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
      comicBookDetail: result.data,
      IMS_inProgress: false,
    });
  };
