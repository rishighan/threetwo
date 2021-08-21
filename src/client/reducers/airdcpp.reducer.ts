import {
  AIRDCPP_SEARCH_INSTANCE_CREATED,
  AIRDCPP_SEARCH_IN_PROGRESS,
  AIRDCPP_SEARCH_RESULTS_RECEIVED,
} from "../constants/action-types";

const initialState = {
  isAirDCPPSearchInProgress: false,
};

function airdcppReducer(state = initialState, action) {
  switch (action.type) {
    case AIRDCPP_SEARCH_INSTANCE_CREATED:
      return {
        ...state,
        searchInstance: action.searchInstance,
      };

    case AIRDCPP_SEARCH_IN_PROGRESS:
      return {
        ...state,
        isAirDCPPSearchInProgress: true,
      };

    case AIRDCPP_SEARCH_RESULTS_RECEIVED:
      return {
        ...state,
        isAirDCPPSearchInProgress: false,
        results: action.results,
      };
    default:
      return state;
  }
}

export default airdcppReducer;
