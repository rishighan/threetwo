/**
 * @fileoverview Search API service for AirDC++ Direct Connect searches.
 * Provides high-level search functionality by wrapping the socket service
 * and managing search instances and result collection.
 * @module services/api/SearchApi
 */

import SocketService from "../DcppSearchService";
import {
  SearchQuery,
  SearchInstance,
  PriorityEnum,
  SearchResponse,
} from "threetwo-ui-typings";
import SearchConstants from "../../constants/search.constants";

/**
 * Configuration data for initiating an AirDC++ search.
 * @interface SearchData
 * @property {Object} query - Search query configuration
 * @property {string} query.pattern - Required search pattern/term
 * @property {string[]|undefined|null} hub_urls - List of hub URLs to search, or null for all hubs
 * @property {PriorityEnum} priority - Download priority for matched results
 */
interface SearchData {
  query: Pick<SearchQuery, "pattern"> & Partial<Omit<SearchQuery, "pattern">>;
  hub_urls: string[] | undefined | null;
  priority: PriorityEnum;
}

/**
 * Pauses execution for a specified duration.
 *
 * @private
 * @param {number} ms - Duration to sleep in milliseconds
 * @returns {Promise} Promise that resolves after the specified delay
 */
function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Initiates a search on the AirDC++ network through connected hubs.
 * Creates a new search instance, registers listeners for results,
 * and sends the search query to the specified hubs.
 *
 * @async
 * @param {SearchData} data - Search configuration data
 * @returns {Promise<Object>} Search queue information from the server
 * @example
 * const queueInfo = await search({
 *   query: { pattern: "Batman #1" },
 *   hub_urls: null, // Search all connected hubs
 *   priority: PriorityEnum.Normal
 * });
 */
export const search = async (data: SearchData) => {
  await SocketService.connect();
  const instance: SearchInstance = await SocketService.post("search");
  const unsubscribe = await SocketService.addListener(
    "search",
    "search_hub_searches_sent",
    (searchInfo) => {
      onSearchSent(data, instance, unsubscribe, searchInfo);
    },
    instance.id,
  );

  const searchQueueInfo = await SocketService.post(
    `search/${instance.id}/hub_search`,
    data,
  );
  return searchQueueInfo;
};

/**
 * Callback handler for when a search query has been sent to hubs.
 * Waits for results to accumulate, then processes the top matches.
 *
 * @private
 * @async
 * @param {SearchData} item - The original search data
 * @param {SearchInstance} instance - The search instance object
 * @param {Function} unsubscribe - Cleanup function to remove the event listener
 * @param {Object} searchInfo - Information about the sent search
 */
const onSearchSent = async (item, instance, unsubscribe, searchInfo) => {
  // Collect the results for 5 seconds
  await sleep(5000);

  // Get only the first result (results are sorted by relevance)
  const results = await SocketService.get(
    `search/${instance.id}/results/0/100`,
  );

  if (results.length > 0) {
    // We have results, download the best one
    // const result = results[0];
    // SocketService.post(`search/${instance.id}/results/${result.id}/download`, {
    //   priority: Utils.toApiPriority(item.priority),
    //   target_directory: item.target_directory,
    // });
  }
  // Remove listener for this search instance
  unsubscribe();
};
