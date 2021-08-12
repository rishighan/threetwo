import axios from "axios";
import rateLimiter from "axios-rate-limit";
import qs from "qs";
import {
  CV_SEARCH_SUCCESS,
  CV_API_CALL_IN_PROGRESS,
  CV_API_GENERIC_FAILURE,
  IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_DB_OBJECT_CALL_FAILED,
  IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
} from "../constants/action-types";
import { COMICBOOKINFO_SERVICE_URI } from "../constants/endpoints";

const http = rateLimiter(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
  maxRPS: 1,
});

export const comicinfoAPICall = (options) => async (dispatch) => {
  try {
    dispatch({
      type: CV_API_CALL_IN_PROGRESS,
      inProgress: true,
    });
    const serviceURI = COMICBOOKINFO_SERVICE_URI + options.callURIAction;
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

export const getComicBookDetailById =
  (comicBookObjectId: string) => async (dispatch) => {
    dispatch({
      type: IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
      IMS_inProgress: true,
    });

    const result = await axios.request({
      url: `http://localhost:3000/api/import/getComicBookById`,
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

export const applyComicVineMatch =
  (match, comicObjectId) => async (dispatch) => {
    dispatch({
      type: IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
      IMS_inProgress: true,
    });
    const result = await axios.request({
      url: "http://localhost:3000/api/import/applyComicVineMetadata",
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
