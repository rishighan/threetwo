import {
  AIRDCPP_SEARCH_IN_PROGRESS,
  AIRDCPP_SEARCH_RESULTS_ADDED,
  AIRDCPP_SEARCH_RESULTS_UPDATED,
  AIRDCPP_HUB_SEARCHES_SENT,
  AIRDCPP_RESULT_DOWNLOAD_INITIATED,
  AIRDCPP_DOWNLOAD_PROGRESS_TICK,
  AIRDCPP_FILE_DOWNLOAD_COMPLETED,
  AIRDCPP_BUNDLES_FETCHED,
  AIRDCPP_TRANSFERS_FETCHED,
  LIBRARY_ISSUE_BUNDLES,
  AIRDCPP_SOCKET_CONNECTED,
  AIRDCPP_SOCKET_DISCONNECTED,
} from "../constants/action-types";
import { LOCATION_CHANGE } from "redux-first-history";
import { isNil, isUndefined } from "lodash";
import { difference } from "../shared/utils/object.utils";

const initialState = {
  searchResults: [],
  isAirDCPPSearchInProgress: false,
  searchInfo: null,
  searchInstance: null,
  downloadResult: null,
  bundleDBImportResult: null,
  downloadFileStatus: {},
  bundles: [],
  transfers: [],
  isAirDCPPSocketConnected: false,
  airDCPPSessionInfo: {},
  socketDisconnectionReason: {},
};

function airdcppReducer(state = initialState, action) {
  switch (action.type) {
    case AIRDCPP_SEARCH_RESULTS_ADDED:
      return {
        ...state,
        searchResults: [...state.searchResults, action.groupedResult],
        isAirDCPPSearchInProgress: true,
      };
    case AIRDCPP_SEARCH_RESULTS_UPDATED:
      const bundleToUpdateIndex = state.searchResults.findIndex(
        (bundle) => bundle.result.id === action.groupedResult.result.id,
      );
      const updatedState = [...state.searchResults];

      if (
        !isNil(
          difference(updatedState[bundleToUpdateIndex], action.groupedResult),
        )
      ) {
        updatedState[bundleToUpdateIndex] = action.groupedResult;
      }

      return {
        ...state,
        searchResults: updatedState,
      };
    case AIRDCPP_SEARCH_IN_PROGRESS:
      return {
        ...state,
        isAirDCPPSearchInProgress: true,
      };
    case AIRDCPP_HUB_SEARCHES_SENT:
      return {
        ...state,
        isAirDCPPSearchInProgress: false,
        searchInfo: action.searchInfo,
        searchInstance: action.instance,
      };
    case AIRDCPP_RESULT_DOWNLOAD_INITIATED:
      return {
        ...state,
        downloadResult: action.downloadResult,
        bundleDBImportResult: action.bundleDBImportResult,
      };
    case AIRDCPP_DOWNLOAD_PROGRESS_TICK:
      return {
        ...state,
        downloadProgressData: action.downloadProgressData,
      };
    case AIRDCPP_BUNDLES_FETCHED:
      return {
        ...state,
        bundles: action.bundles,
      };
    case LIBRARY_ISSUE_BUNDLES:
      return {
        ...state,
        issue_bundles: action.issue_bundles,
      };
    case AIRDCPP_FILE_DOWNLOAD_COMPLETED:
      console.log("COMPLETED", action);
      return {
        ...state,
      };
    case AIRDCPP_TRANSFERS_FETCHED:
      return {
        ...state,
        transfers: action.bundles,
      };

    case AIRDCPP_SOCKET_CONNECTED:
      return {
        ...state,
        isAirDCPPSocketConnected: true,
        airDCPPSessionInfo: action.data,
      };

    case AIRDCPP_SOCKET_DISCONNECTED:
      return {
        ...state,
        isAirDCPPSocketConnected: false,
        socketDisconnectionReason: action.data,
      };
    case LOCATION_CHANGE:
      return {
        searchResults: [],
        isAirDCPPSearchInProgress: false,
        searchInfo: null,
        searchInstance: null,
        downloadResult: null,
        bundleDBImportResult: null,
        // bundles: [],
      };
    default:
      return state;
  }
}

export default airdcppReducer;
