import axios from "axios";
import rateLimiter from "axios-rate-limit";

import qs from "qs";
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

import { setupCache } from "axios-cache-interceptor";

// same object, but with updated typings.
const axiosWithCache = setupCache(axios);

const http = rateLimiter(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
  maxRPS: 1,
});

export const getWeeklyPullList = (options) => async (dispatch) => {
  try {
    dispatch({
      type: CV_WEEKLY_PULLLIST_CALL_IN_PROGRESS,
    });
    axiosWithCache({
      url: `${COMICVINE_SERVICE_URI}/getWeeklyPullList`,
      method: "get",
      params: options,
    }).then((response) => {
      dispatch({
        type: CV_WEEKLY_PULLLIST_FETCHED,
        data: response.data.result,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const comicinfoAPICall = (options) => async (dispatch) => {
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
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: "repeat" });
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
        console.log("Could not complete request.");
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: CV_API_GENERIC_FAILURE,
      error,
    });
  }
};
export const getIssuesForSeries =
  (comicObjectID: string) => async (dispatch) => {
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
      issues: issues.data,
    });
  };

export const analyzeLibrary = (issues) => async (dispatch) => {
  dispatch({
    type: CV_ISSUES_METADATA_CALL_IN_PROGRESS,
  });
  const queryObjects = issues.map((issue) => {
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

export const getLibraryStatistics = () => async dispatch => {
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

export const getComicBookDetailById =
  (comicBookObjectId: string) => async (dispatch) => {
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

export const getComicBooksDetailsByIds =
  (comicBookObjectIds: Array<string>) => async (dispatch) => {
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

export const applyComicVineMatch =
  (match, comicObjectId) => async (dispatch) => {
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
