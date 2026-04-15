/**
 * @fileoverview Action creators for Metron comic database API integration.
 * Provides functions to fetch comic metadata resources from the Metron service.
 * @module actions/metron
 */

import axios from "axios";
import { isNil } from "lodash";
import { METRON_SERVICE_URI } from "../constants/endpoints";

/** Options for fetching Metron resources */
interface MetronFetchOptions {
  query: {
    page: number;
    resource?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Metron resource result item */
interface MetronResultItem {
  name?: string;
  __str__?: string;
  id: number;
}

/** Metron resource result format */
interface MetronResourceResult {
  options: Array<{ label: string; value: number }>;
  hasMore: boolean;
  additional: {
    page: number | null;
  };
}

/**
 * @typedef {Object} MetronResourceResult
 * @property {Array<{label: string, value: number}>} options - Formatted options for select components
 * @property {boolean} hasMore - Whether more results are available
 * @property {Object} additional - Additional pagination data
 * @property {number|null} additional.page - Next page number, or null if no more pages
 */

/**
 * Fetches comic resources from the Metron API service.
 * Returns formatted data suitable for async select/dropdown components.
 *
 * @async
 * @param {Object} options - Request options for the Metron API
 * @param {Object} options.query - Query parameters
 * @param {number} options.query.page - Current page number for pagination
 * @returns {Promise<MetronResourceResult>} Formatted results with pagination info
 * @example
 * const results = await fetchMetronResource({
 *   query: { page: 1, resource: "publishers" }
 * });
 * // Returns: { options: [{label: "DC Comics", value: 1}], hasMore: true, additional: { page: 2 } }
 */
export const fetchMetronResource = async (options: MetronFetchOptions): Promise<MetronResourceResult> => {
  const metronResourceResults = await axios.post(
    `${METRON_SERVICE_URI}/fetchResource`,
    options,
  );
  const results = metronResourceResults.data.results.map((result: MetronResultItem) => {
    return {
      label: result.name || result.__str__,
      value: result.id,
    };
  });

  return {
    options: results,
    hasMore: !isNil(metronResourceResults.data.next),
    additional: {
      page: !isNil(metronResourceResults.data.next)
        ? options.query.page + 1
        : null,
    },
  };
};
