import {
  CV_API_CALL_IN_PROGRESS,
  CV_SEARCH_SUCCESS,
} from "../constants/action-types";
const initialState = {
  searchResults: [],
};

function comicinfoReducer(state = initialState, action) {
  switch (action.type) {
    case CV_API_CALL_IN_PROGRESS:
      return {
        ...state,
        result: {},
      };
    case CV_SEARCH_SUCCESS:
      return {
        ...state,
        searchResults: action.searchResults.results,
      };
    default:
      return state;
  }
}

export default comicinfoReducer;
