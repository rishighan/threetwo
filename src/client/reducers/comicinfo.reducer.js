import {
  CV_API_CALL_IN_PROGRESS,
  CV_SEARCH_SUCCESS,
  CV_CLEANUP,
} from "../constants/action-types";
const initialState = {
  searchResults: [],
  searchQuery: {},
  inProgress: false,
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
        searchResults: action.searchResults.results,
        searchQuery: action.searchQueryObject,
        inProgress: false,
      };
    case CV_CLEANUP:
      return {
        searchResults: [],
        searchQuery: {},
      };
    default:
      return state;
  }
}

export default comicinfoReducer;
