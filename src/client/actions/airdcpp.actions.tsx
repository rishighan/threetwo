import {
  SearchQuery,
  SearchInstance,
  PriorityEnum,
  SearchResponse,
} from "threetwo-ui-typings";
import {
  LIBRARY_SERVICE_BASE_URI,
  SEARCH_SERVICE_BASE_URI,
} from "../constants/endpoints";
import {
  AIRDCPP_SEARCH_RESULTS_ADDED,
  AIRDCPP_SEARCH_RESULTS_UPDATED,
  AIRDCPP_HUB_SEARCHES_SENT,
  AIRDCPP_RESULT_DOWNLOAD_INITIATED,
  AIRDCPP_DOWNLOAD_PROGRESS_TICK,
  AIRDCPP_BUNDLES_FETCHED,
  AIRDCPP_SEARCH_IN_PROGRESS,
  AIRDCPP_FILE_DOWNLOAD_COMPLETED,
  LS_SINGLE_IMPORT,
  IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
  AIRDCPP_TRANSFERS_FETCHED,
  LIBRARY_ISSUE_BUNDLES,
  AIRDCPP_SOCKET_CONNECTED,
  AIRDCPP_SOCKET_DISCONNECTED,
} from "../constants/action-types";
import { isNil } from "lodash";
import axios from "axios";

interface SearchData {
  query: Pick<SearchQuery, "pattern"> & Partial<Omit<SearchQuery, "pattern">>;
  hub_urls: string[] | undefined | null;
  priority: PriorityEnum;
}

export const sleep = (ms: number): Promise<NodeJS.Timeout> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const toggleAirDCPPSocketConnectionStatus =
  (status: String, payload?: any) => async (dispatch) => {
    switch (status) {
      case "connected":
        dispatch({
          type: AIRDCPP_SOCKET_CONNECTED,
          data: payload,
        });
        break;

      case "disconnected":
        dispatch({
          type: AIRDCPP_SOCKET_DISCONNECTED,
          data: payload,
        });
        break;

      default:
        console.log("Can't set AirDC++ socket status.");
        break;
    }
  };
export const downloadAirDCPPItem =
  (
    searchInstanceId: Number,
    resultId: String,
    comicObjectId: String,
    name: String,
    size: Number,
    type: any,
    ADCPPSocket: any,
    credentials: any,
  ): void =>
  async (dispatch) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect();
      }
      let bundleDBImportResult = {};
      const downloadResult = await ADCPPSocket.post(
        `search/${searchInstanceId}/results/${resultId}/download`,
      );

      if (!isNil(downloadResult)) {
        bundleDBImportResult = await axios({
          method: "POST",
          url: `${LIBRARY_SERVICE_BASE_URI}/applyAirDCPPDownloadMetadata`,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          data: {
            bundleId: downloadResult.bundle_info.id,
            comicObjectId,
            name,
            size,
            type,
          },
        });

        dispatch({
          type: AIRDCPP_RESULT_DOWNLOAD_INITIATED,
          downloadResult,
          bundleDBImportResult,
        });

        dispatch({
          type: IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
          comicBookDetail: bundleDBImportResult.data,
          IMS_inProgress: false,
        });
      }
    } catch (error) {
      throw error;
    }
  };

export const getBundlesForComic =
  (comicObjectId: string, ADCPPSocket: any, credentials: any) =>
  async (dispatch) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect();
      }
      const comicObject = await axios({
        method: "POST",
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookById`,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        data: {
          id: `${comicObjectId}`,
        },
      });
      // get only the bundles applicable for the comic
      if (comicObject.data.acquisition.directconnect) {
        const filteredBundles =
          comicObject.data.acquisition.directconnect.downloads.map(
            async ({ bundleId }) => {
              return await ADCPPSocket.get(`queue/bundles/${bundleId}`);
            },
          );
        dispatch({
          type: AIRDCPP_BUNDLES_FETCHED,
          bundles: await Promise.all(filteredBundles),
        });
      }
    } catch (error) {
      throw error;
    }
  };

export const getTransfers =
  (ADCPPSocket: any, credentials: any) => async (dispatch) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect();
      }
      const bundles = await ADCPPSocket.get("queue/bundles/1/85", {});
      if (!isNil(bundles)) {
        dispatch({
          type: AIRDCPP_TRANSFERS_FETCHED,
          bundles,
        });
        const bundleIds = bundles.map((bundle) => bundle.id);
        // get issues with matching bundleIds
        const issue_bundles = await axios({
          url: `${SEARCH_SERVICE_BASE_URI}/groupIssuesByBundles`,
          method: "POST",
          data: { bundleIds },
        });
        dispatch({
          type: LIBRARY_ISSUE_BUNDLES,
          issue_bundles,
        });
      }
    } catch (err) {
      throw err;
    }
  };
