import {
  CV_API_CALL_IN_PROGRESS,
  CV_SEARCH_SUCCESS,
  CV_CLEANUP,
  IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
  IMS_COMIC_BOOK_DB_OBJECT_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_DB_OBJECT_CALL_FAILED,
  CV_ISSUES_METADATA_CALL_IN_PROGRESS,
  CV_ISSUES_METADATA_FETCH_SUCCESS,
} from "../constants/action-types";
const initialState = {
  searchResults: [],
  searchQuery: {},
  inProgress: false,
  comicBookDetail: {},
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
    case CV_CLEANUP:
      return {
        ...state,
        searchResults: [],
        searchQuery: {},
      };
    case CV_ISSUES_METADATA_CALL_IN_PROGRESS:
      return {
        inProgress: true,
        ...state,
      };
    case CV_ISSUES_METADATA_FETCH_SUCCESS:
      console.log(action);
      return {
        ...state,
        issuesForVolume: action.issues.data,
      };
    default:
      return state;
  }
}

export default comicinfoReducer;
