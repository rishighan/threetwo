import { isEmpty } from "lodash";
import {
  CV_API_CALL_IN_PROGRESS,
  CV_SEARCH_SUCCESS,
  CV_CLEANUP,
  IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
  IMS_COMIC_BOOKS_DB_OBJECTS_FETCHED,
  IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
  CV_ISSUES_METADATA_CALL_IN_PROGRESS,
  CV_ISSUES_MATCHES_IN_LIBRARY_FETCHED,
  CV_ISSUES_FOR_VOLUME_IN_LIBRARY_SUCCESS,
} from "../constants/action-types";

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
      return {
        ...state,
        issuesForVolume: action.issues,
        inProgress: false,
      };

    case CV_ISSUES_MATCHES_IN_LIBRARY_FETCHED:
      const updatedState = [...state.issuesForVolume];
      action.matches.map((match) => {
        updatedState.map((issue, idx) => {
          let matches = [];
          if (!isEmpty(match.hits.hits)) {
            return match.hits.hits.map((hit) => {
              if (
                parseInt(issue.issue_number, 10) ===
                hit._source.inferredMetadata.issue.number
              ) {
                matches.push(hit);
                const updatedIssueResult = { ...issue, matches };
                updatedState[idx] = updatedIssueResult;
              }
            });
          }
        });
      });
      return {
        ...state,
        issuesForVolume: updatedState,
      };
    default:
      return state;
  }
}

export default comicinfoReducer;
