import {
  AIRDCPP_SEARCH_INSTANCE_CREATED,
  AIRDCPP_SEARCH_IN_PROGRESS,
  AIRDCPP_SEARCH_RESULTS_RECEIVED,
  AIRDCPP_HUB_SEARCHES_SENT,
  AIRDCPP_HUB_USER_CONNECTED,
} from "../constants/action-types";

const initialState = {
  isAirDCPPSearchInProgress: false,
  searchStatus: "",
};

function airdcppReducer(state = initialState, action) {
  switch (action.type) {
    case AIRDCPP_HUB_USER_CONNECTED:
        return {
            ...state,
            searchStatus: "Hub user connected",
        }
    case AIRDCPP_SEARCH_INSTANCE_CREATED:
      return {
        ...state,
        searchInstance: action.searchInstance,
        searchStatus: "Search Instance created",
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
    case AIRDCPP_HUB_SEARCHES_SENT:
      return {
        ...state,
        searchStatus: "Hub searches sent",
        isAirDCPPSearchInProgress: true,
      };

    default:
      return state;
  }
}

export default airdcppReducer;
