import {
  CV_API_CALL_IN_PROGRESS,
  CV_SEARCH_SUCCESS,
} from "../constants/action-types";
const initialState = {
  searchResults: [],
  searchQuery: {},
};

function comicinfoReducer(state = initialState, action) {
  switch (action.type) {
    case CV_API_CALL_IN_PROGRESS:
      return {
        ...state,
        result: {},
      };
    case CV_SEARCH_SUCCESS:
      console.log(action);
      return {
        ...state,
        searchResults: action.searchResults.results,
        searchQuery: action.searchQueryObject,
      };
    default:
      return state;
  }
}

export default comicinfoReducer;
