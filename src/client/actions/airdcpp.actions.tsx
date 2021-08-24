import SocketService from "../services/DcppSearchService";
import {
  SearchQuery,
  SearchInstance,
  PriorityEnum,
  SearchResponse,
} from "threetwo-ui-typings";
import {
  AIRDCPP_SEARCH_RESULTS_RECEIVED,
  AIRDCPP_HUB_SEARCHES_SENT,
  AIRDCPP_RESULT_DOWNLOAD_INITIATED,
  AIRDCPP_DOWNLOAD_PROGRESS_TICK,
} from "../constants/action-types";
import { isNil } from "lodash";
import axios from "axios";

interface SearchData {
  query: Pick<SearchQuery, "pattern"> & Partial<Omit<SearchQuery, "pattern">>;
  hub_urls: string[] | undefined | null;
  priority: PriorityEnum;
}

function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const search = (data: SearchData) => async (dispatch) => {
  await SocketService.connect("admin", "password", true);
  const instance: SearchInstance = await SocketService.post("search");

  SocketService.addListener(
    `search/${instance.id}`,
    "search_hub_searches_sent",
    async (searchInfo) => {
      dispatch({
        type: AIRDCPP_HUB_SEARCHES_SENT,
        searchInfo,
        instance,
      });
    },
  );

  await SocketService.post<SearchResponse>(
    `search/${instance.id}/hub_search`,
    data,
  );

  await sleep(10000);
  const results = await SocketService.get(`search/${instance.id}/results/0/25`);
  dispatch({
    type: AIRDCPP_SEARCH_RESULTS_RECEIVED,
    results,
  });
  SocketService.disconnect();
  return results;
};

export const downloadAirDCPPItem =
  (instanceId: string, resultId: string, comicObjectId: string): void =>
  async (dispatch) => {
    try {
      let bundleDBImportResult = {};
      await SocketService.connect("admin", "password", true);
      const downloadResult = await SocketService.post(
        `search/${instanceId}/results/${resultId}/download`,
      );

      if (!isNil(downloadResult)) {
        bundleDBImportResult = await axios({
          method: "POST",
          url: "http://localhost:3000/api/import/applyAirDCPPDownloadMetadata",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          data: {
            resultId,
            comicObjectId,
            downloadResult,
            searchInstanceId: instanceId,
          },
        });
        dispatch({
          type: AIRDCPP_RESULT_DOWNLOAD_INITIATED,
          downloadResult: downloadResult,
          bundleDBImportResult,
        });
      }

      SocketService.disconnect();
    } catch (error) {
      throw error;
    }
  };

export const getDownloadProgress =
  (fileId: string, directoryId?: string): void =>
  async (dispatch) => {
    try {
      await SocketService.connect("admin", "password", true);
      SocketService.addListener(
        `queue`,
        "queue_bundle_tick",
        async (downloadProgressData) => {
          dispatch({
            type: AIRDCPP_DOWNLOAD_PROGRESS_TICK,
            downloadProgressData,
          });
        },
      );
    } catch (error) {
      throw error;
    }
  };
