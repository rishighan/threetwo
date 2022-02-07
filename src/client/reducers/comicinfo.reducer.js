import { isEmpty, extend, each } from "lodash";
import {
  CV_API_CALL_IN_PROGRESS,
  CV_SEARCH_SUCCESS,
  CV_CLEANUP,
  IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
  IMS_COMIC_BOOKS_DB_OBJECTS_FETCHED,
  IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
  CV_ISSUES_METADATA_CALL_IN_PROGRESS,
  CV_ISSUES_METADATA_FETCH_SUCCESS,
  CV_ISSUES_FOR_VOLUME_IN_LIBRARY_UPDATED,
  CV_ISSUES_MATCHES_IN_LIBRARY_FETCHED,
  CV_ISSUES_FOR_VOLUME_IN_LIBRARY_SUCCESS,
} from "../constants/action-types";
import { refineQuery } from "filename-parser";

const initialState = {
  searchResults: [],
  searchQuery: {},
  inProgress: false,
  comicBookDetail: {},
  comicBooksDetails: [],
  issuesForVolume: [],
  IMS_inProgress: false,
};

function comicinfoReducer(state = initialState, action) {
  switch (action.type) {
    case CV_API_CALL_IN_PROGRESS:
      return {
        ...state,
        inProgress: true,
      };
    case CV_SEARCH_SUCCESS:
      return {
        ...state,
        searchResults: action.searchResults,
        searchQuery: action.searchQueryObject,
        inProgress: false,
      };
    case IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS:
      return {
        ...state,
        IMS_inProgress: true,
      };

    case IMS_COMIC_BOOK_DB_OBJECT_FETCHED:
      return {
        ...state,
        comicBookDetail: action.comicBookDetail,
        IMS_inProgress: false,
      };
    case IMS_COMIC_BOOKS_DB_OBJECTS_FETCHED:
      console.log(action);
      return {
        ...state,
        comicBooksDetails: action.comicBooks,
        IMS_inProgress: false,
      };
    case CV_CLEANUP:
      return {
        ...state,
        searchResults: [],
        searchQuery: {},
        issuesForVolume: [],
      };
    case CV_ISSUES_METADATA_CALL_IN_PROGRESS:
      return {
        inProgress: true,
        ...state,
      };

    case CV_ISSUES_FOR_VOLUME_IN_LIBRARY_SUCCESS:
      // console.log("jagan", action);
      return {
        ...state,
        issuesForVolume: action.issues,
        inProgress: false,
      };
    case CV_ISSUES_MATCHES_IN_LIBRARY_FETCHED:
      console.log(action);
      const updatedState = [...state.issuesForVolume];

      // updatedState[issueToUpdateIndex].matches = action.result.matches;
      // console.log(issueToUpdateIndex);
      // console.log(updatedState[issueToUpdateIndex]);

      return {
        ...state,
        issuesForVolume: updatedState,
      };
    default:
      return state;
  }
}

export default comicinfoReducer;
