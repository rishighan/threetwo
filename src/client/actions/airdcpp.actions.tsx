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
  AIRDCPP_SEARCH_IN_PROGRESS,
  IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
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
  try {
    if (!SocketService.isConnected()) {
      await SocketService.connect("admin", "password", true);
    }
    const instance: SearchInstance = await SocketService.post("search");
    dispatch({
      type: AIRDCPP_SEARCH_IN_PROGRESS,
    });

    // We want to get notified about every new result in order to make the user experience better
    await SocketService.addListener(
      `search`,
      "search_result_added",
      async (groupedResult) => {
        // ...add the received result in the UI
        // (it's probably a good idea to have some kind of throttling for the UI updates as there can be thousands of results)

        dispatch({
          type: AIRDCPP_SEARCH_RESULTS_RECEIVED,
          groupedResult,
        });
      },
      instance.id,
    );

    // We also want to update the existing items in our list when new hits arrive for the previously listed files/directories
    await SocketService.addListener(
      `search`,
      "search_result_updated",
      async (groupedResult) => {
        // ...update properties of the existing result in the UI
        dispatch({
          type: AIRDCPP_SEARCH_RESULTS_RECEIVED,
          groupedResult,
        });
      },
      instance.id,
    );

    // We need to show something to the user in case the search won't yield any results so that he won't be waiting forever)
    // Wait for 5 seconds for any results to arrive after the searches were sent to the hubs
    await SocketService.addListener(
      `search`,
      "search_hub_searches_sent",
      async (searchInfo) => {
        await sleep(5000);

        // Check the number of received results (in real use cases we should know that even without calling the API)
        const currentInstance = await SocketService.get(
          `search/${instance.id}`,
        );
        if (currentInstance.result_count === 0) {
          // ...nothing was received, show an informative message to the user
        }

        // The search can now be considered to be "complete"
        // If there's an "in progress" indicator in the UI, that could also be disabled here
        dispatch({
          type: AIRDCPP_HUB_SEARCHES_SENT,
          searchInfo,
          instance,
        });
      },
      instance.id,
    );

    // Finally, perform the actual search
    await SocketService.post(`search/${instance.id}/hub_search`, data);
  } catch (error) {
    console.log(error);
    throw error;
  }
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

export const getDownloadProgress =
  (comicObjectId: string): void =>
  async (dispatch) => {
    try {
      if (!SocketService.isConnected()) {
        await SocketService.connect("admin", "password", true);
      }
      await SocketService.addListener(
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
      const filteredBundles = comicObject.data.acquisition.directconnect.map(
        async ({ bundleId }) => {
          return await SocketService.get(`queue/bundles/${bundleId}`);
        },
      );
      dispatch({
        type: AIRDCPP_BUNDLES_FETCHED,
        bundles: await Promise.all(filteredBundles),
      });
    } catch (error) {
      throw error;
    }
  };
