import axios from "axios";
import rateLimiter from "axios-rate-limit";
import { map } from "lodash";
import qs from "qs";
import { IExtractionOptions } from "threetwo-ui-typings";
import {
  CV_SEARCH_SUCCESS,
  CV_API_CALL_IN_PROGRESS,
  CV_API_GENERIC_FAILURE,
  IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_SUCCESS,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS,
  CV_ISSUES_METADATA_CALL_IN_PROGRESS,
  CV_CLEANUP,
  IMS_COMIC_BOOKS_DB_OBJECTS_FETCHED,
} from "../constants/action-types";
import {
  COMICBOOKINFO_SERVICE_URI,
  LIBRARY_SERVICE_BASE_URI,
} from "../constants/endpoints";

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
    const serviceURI = `${COMICBOOKINFO_SERVICE_URI}/${options.callURIAction}`;
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
export const findIssuesForSeriesInLibrary =
  (comicObjectID: any) => async (dispatch) => {
    dispatch({
      type: CV_ISSUES_METADATA_CALL_IN_PROGRESS,
    });
    dispatch({
      type: CV_CLEANUP,
    });

    await axios({
      url: `${LIBRARY_SERVICE_BASE_URI}/findIssuesForSeriesInLibrary`,
      method: "POST",
      params: {
        comicObjectID,
      },
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

export const extractComicArchive =
  (path: string, options: IExtractionOptions) => async (dispatch) => {
    const comicBookPages: string[] = [];
    dispatch({
      type: IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS,
    });
    const extractedComicBookArchive = await axios({
      method: "POST",
      url: `${LIBRARY_SERVICE_BASE_URI}/unrarArchive`,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      data: {
        options,
        filePath: path,
      },
    });
    map(extractedComicBookArchive.data, (page) => {
      const foo = page.path.split("/");
      const folderName = foo[foo.length - 1];
      const imagePath = encodeURI(
        `${LIBRARY_SERVICE_BASE_URI}/userdata/expanded/` +
          folderName +
          `/` +
          page.name +
          page.extension,
      );
      comicBookPages.push(imagePath);
    });
    console.log(comicBookPages);
    dispatch({
      type: IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_SUCCESS,
      extractedComicBookArchive: comicBookPages,
    });
  };
