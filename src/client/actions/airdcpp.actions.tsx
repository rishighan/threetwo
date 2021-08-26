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
  AIRDCPP_BUNDLES_FETCHED,
} from "../constants/action-types";
import { each, isNil } from "lodash";
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
  return results;
};

export const downloadAirDCPPItem =
  (instanceId: string, resultId: string, comicObjectId: string): void =>
  async (dispatch) => {
    try {
      if (!SocketService.isConnected()) {
        await SocketService.connect("admin", "password", true);
      }
      let bundleDBImportResult = {};
      const downloadResult = await SocketService.post(
        `search/${instanceId}/results/${resultId}/download`,
      );

      let bundleId;
      let directoryIds;
      if (!isNil(downloadResult.bundle_info)) {
        bundleId = downloadResult.bundle_info.id;
      }
      if (!isNil(downloadResult.directory_download_ids)) {
        directoryIds = downloadResult.directory_download_ids.map(
          (item) => item.id,
        );
      }

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
            searchInstanceId: instanceId,
            bundleId,
            directoryIds,
          },
        });
        dispatch({
          type: AIRDCPP_RESULT_DOWNLOAD_INITIATED,
          downloadResult: downloadResult,
          bundleDBImportResult,
        });
      }
    } catch (error) {
      throw error;
    }
  };

export const getDownloadProgress =
  (comicObjectId: string): void =>
  async (dispatch) => {
    try {
      if (!SocketService.isConnected()) {
        await SocketService.connect("admin", "password", true);
      }
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

export const getBundlesForComic =
  (comicObjectId: string) => async (dispatch) => {
    try {
      if (!SocketService.isConnected()) {
        await SocketService.connect("admin", "password", true);
      }
      const bundles = await SocketService.get("queue/bundles/0/500");
      const comicObject = await axios({
        method: "POST",
        url: "http://localhost:3000/api/import/getComicBookById",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        data: {
          id: `${comicObjectId}`,
        },
      });
      // get only the bundles applicable for the comic
      const filteredBundles = [];
      comicObject.data.acquisition.directconnect.map(({ bundleId }) => {
        each(bundles, (bundle) => {
          if (bundle.id === bundleId) {
            filteredBundles.push(bundle);
          }
        });
      });

      dispatch({
        type: AIRDCPP_BUNDLES_FETCHED,
        bundles: filteredBundles,
      });
    } catch (error) {
      throw error;
    }
  };
