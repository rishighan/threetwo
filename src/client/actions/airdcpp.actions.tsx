import SocketService from "../services/DcppSearchService";
import {
  SearchQuery,
  SearchInstance,
  PriorityEnum,
  SearchResponse,
} from "threetwo-ui-typings";
import { LIBRARY_SERVICE_BASE_URI } from "../constants/endpoints";
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

export const search =
  (data: SearchData, ADCPPSocket: any, credentials: any) =>
  async (dispatch) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect(
          credentials.username,
          credentials.password,
          true,
        );
      }
      const instance: SearchInstance = await ADCPPSocket.post("search");
      dispatch({
        type: AIRDCPP_SEARCH_IN_PROGRESS,
      });

      // We want to get notified about every new result in order to make the user experience better
      await ADCPPSocket.addListener(
        `search`,
        "search_result_added",
        async (groupedResult) => {
          // ...add the received result in the UI
          // (it's probably a good idea to have some kind of throttling for the UI updates as there can be thousands of results)

          dispatch({
            type: AIRDCPP_SEARCH_RESULTS_ADDED,
            groupedResult,
          });
        },
        instance.id,
      );

      // We also want to update the existing items in our list when new hits arrive for the previously listed files/directories
      await ADCPPSocket.addListener(
        `search`,
        "search_result_updated",
        async (groupedResult) => {
          // ...update properties of the existing result in the UI
          dispatch({
            type: AIRDCPP_SEARCH_RESULTS_UPDATED,
            groupedResult,
          });
        },
        instance.id,
      );

      // We need to show something to the user in case the search won't yield any results so that he won't be waiting forever)
      // Wait for 5 seconds for any results to arrive after the searches were sent to the hubs
      await ADCPPSocket.addListener(
        `search`,
        "search_hub_searches_sent",
        async (searchInfo) => {
          await sleep(5000);

          // Check the number of received results (in real use cases we should know that even without calling the API)
          const currentInstance = await ADCPPSocket.get(
            `search/${instance.id}`,
          );
          if (currentInstance.result_count === 0) {
            // ...nothing was received, show an informative message to the user
            console.log("No more search results.");
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
      await ADCPPSocket.post(`search/${instance.id}/hub_search`, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

export const downloadAirDCPPItem =
  (
    instanceId: string,
    resultId: string,
    comicObjectId: string,
    comicObject: any,
    ADCPPSocket: any,
    credentials: any,
  ): void =>
  async (dispatch) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect(
          `${credentials.username}`,
          `${credentials.password}`,
          true,
        );
      }
      console.log(comicObject);
      let bundleDBImportResult = {};
      const downloadResult = await ADCPPSocket.post(
        `search/${instanceId}/results/${resultId}/download`,
      );
      let downloadStatus = undefined;
      let count = 0;
      // download status check
      await ADCPPSocket.addListener(`queue`, "queue_file_status", (status) => {
        if (status.status.completed) {
          downloadStatus = status;
          if (count === 0) {
            dispatch({
              type: LS_SINGLE_IMPORT,
              meta: { remote: true },
              data: { downloadStatus, comicObjectId, comicObject },
            });
          }
          count += 1;
        }
      });

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
          url: `${LIBRARY_SERVICE_BASE_URI}/applyAirDCPPDownloadMetadata`,
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
  (comicObjectId: string, ADCPPSocket: any, credentials: any): void =>
  async (dispatch) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect(
          `${credentials.username}`,
          `${credentials.password}`,
          true,
        );
      }
      await ADCPPSocket.addListener(
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
  (comicObjectId: string, ADCPPSocket: any, credentials: any) =>
  async (dispatch) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect(
          `${credentials.username}`,
          `${credentials.password}`,
          true,
        );
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
      const filteredBundles = comicObject.data.acquisition.directconnect.map(
        async ({ bundleId }) => {
          return await ADCPPSocket.get(`queue/bundles/${bundleId}`);
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

export const getTransfers =
  (ADCPPSocket: any, credentials: any) => async (dispatch) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect(
          `${credentials.username}`,
          `${credentials.password}`,
          true,
        );
      }
      const transfers = await ADCPPSocket.get("queue/bundles/1/50", {});
      if (!isNil(transfers)) {
        dispatch({
          type: AIRDCPP_TRANSFERS_FETCHED,
          transfers,
        });
      }
    } catch (err) {
      throw err;
    }
  };
