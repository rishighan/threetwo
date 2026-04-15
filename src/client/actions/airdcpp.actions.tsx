/**
 * @fileoverview Redux action creators for AirDC++ integration.
 * Provides actions for Direct Connect protocol operations including
 * search, download management, and socket connection handling.
 * @module actions/airdcpp
 */

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

import type { AirDCPPSearchData } from "../types";

/**
 * Creates a promise that resolves after a specified delay.
 * Useful for rate limiting or adding delays between operations.
 *
 * @param {number} ms - Number of milliseconds to sleep
 * @returns {Promise<NodeJS.Timeout>} Promise that resolves after the delay
 * @example
 * await sleep(1000); // Wait 1 second
 */
export const sleep = (ms: number): Promise<NodeJS.Timeout> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Redux thunk action creator to toggle AirDC++ socket connection status.
 * Dispatches connection or disconnection events to update application state.
 *
 * @param {String} status - Connection status ("connected" or "disconnected")
 * @param {any} [payload] - Optional payload data for the status change
 * @returns {Function} Redux thunk function
 */
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
        break;
    }
  };

/**
 * Redux thunk action creator to download an item from AirDC++ search results.
 * Initiates the download, stores bundle metadata in the database, and updates
 * the comic book record with download information.
 *
 * @param {Number} searchInstanceId - ID of the active search instance
 * @param {String} resultId - ID of the search result to download
 * @param {String} comicObjectId - ID of the comic book in the database
 * @param {String} name - Name of the file to download
 * @param {Number} size - Size of the file in bytes
 * @param {any} type - File type information
 * @param {any} ADCPPSocket - AirDC++ socket connection instance
 * @param {any} credentials - Authentication credentials for AirDC++
 * @returns {Function} Redux thunk function
 * @throws {Error} If download initiation or database update fails
 */
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

/**
 * Redux thunk action creator to fetch AirDC++ download bundles for a specific comic.
 * Retrieves the comic book record, extracts associated bundle IDs, and fetches
 * bundle details from the AirDC++ queue.
 *
 * @param {string} comicObjectId - ID of the comic book in the database
 * @param {any} ADCPPSocket - AirDC++ socket connection instance
 * @param {any} credentials - Authentication credentials for AirDC++
 * @returns {Function} Redux thunk function that dispatches AIRDCPP_BUNDLES_FETCHED
 * @throws {Error} If fetching comic or bundles fails
 */
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

/**
 * Redux thunk action creator to fetch all active transfers from AirDC++.
 * Retrieves current download bundles and groups library issues by their
 * associated bundle IDs for display in the UI.
 *
 * @param {any} ADCPPSocket - AirDC++ socket connection instance
 * @param {any} credentials - Authentication credentials for AirDC++
 * @returns {Function} Redux thunk function that dispatches AIRDCPP_TRANSFERS_FETCHED
 *                     and LIBRARY_ISSUE_BUNDLES actions
 * @throws {Error} If fetching transfers fails
 */
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
