import { useState } from "react";
import axios from "axios";
import { isNil, isUndefined, isEmpty } from "lodash";
import { refineQuery } from "filename-parser";
import { COMICVINE_SERVICE_URI } from "../../../../../constants/endpoints";
import { RawFileDetails as RawFileDetailsType } from "../../../../../graphql/generated";
import { useStore } from "../../../../../store";

/**
 * Represents a search result match from ComicVine API.
 * Contains scoring information and additional match properties.
 */
type ComicVineMatch = {
  /** Numerical score indicating match quality (higher is better) */
  score: number;
  /** Additional match properties from ComicVine API response */
  [key: string]: any;
};

/**
 * Represents a search query structure for ComicVine metadata matching.
 * Contains parsed details from filename or user input for comic issue identification.
 */
type ComicVineSearchQuery = {
  /** Inferred details about the comic issue */
  inferredIssueDetails: {
    /** The name/title of the comic series */
    name: string;
    /** Additional inferred properties from filename parsing */
    [key: string]: any;
  };
  /** Additional query properties */
  [key: string]: any;
};

/**
 * Represents existing ComicVine metadata structure.
 * Used when parsing from previously stored metadata.
 */
type ComicVineMetadata = {
  /** The name/title from existing metadata */
  name?: string;
  /** Additional metadata properties */
  [key: string]: any;
};

/**
 * Hook for managing ComicVine metadata matching.
 *
 * This custom React hook provides functionality to search for comic metadata matches
 * using the ComicVine API service. It handles the parsing of file details, manual search
 * overrides, and existing metadata to construct appropriate search queries.
 *
 * The hook maintains state for matched results and provides methods to fetch new matches
 * based on different input sources (filename parsing, manual input, or existing metadata).
 *
 * @returns {object} Hook return object
 * @returns {ComicVineMatch[]} returns.comicVineMatches - Array of scored matches from ComicVine API, sorted by score descending
 * @returns {function} returns.prepareAndFetchMatches - Function to initiate search with various input types
 *
 * @example
 * ```typescript
 * const { comicVineMatches, prepareAndFetchMatches } = useComicVineMatching();
 *
 * // Search using raw file details
 * prepareAndFetchMatches(rawFileDetails);
 *
 * // Search with manual override
 * prepareAndFetchMatches(rawFileDetails, undefined, {
 *   issueName: "Spider-Man",
 *   issueNumber: "1",
 *   issueYear: "2023"
 * });
 * ```
 */
export const useComicVineMatching = () => {
  const [comicVineMatches, setComicVineMatches] = useState<ComicVineMatch[]>([]);
  const { comicvine } = useStore();

  /**
   * Fetches matches from the ComicVine volumeBasedSearch API endpoint.
   *
   * This function performs the actual API call to the ComicVine service endpoint,
   * processes the response, handles errors, and updates the component state with
   * the sorted match results. It uses axios for HTTP requests and handles both
   * single result and multiple results responses.
   *
   * @param {any} searchPayload - Raw file details to include in the request for context
   * @param {ComicVineSearchQuery} issueSearchQuery - Parsed search query containing series name and other details
   *
   * @returns {Promise<void>} Resolves when the fetch operation completes
   *
   * @throws {Error} Silently handles errors (could be enhanced with proper error logging)
   *
   * @example
   * ```typescript
   * const searchQuery = {
   *   inferredIssueDetails: {
   *     name: "Amazing Spider-Man"
   *   }
   * };
   * await fetchComicVineMatches(rawFileDetails, searchQuery);
   * ```
   */
  const fetchComicVineMatches = async (
    searchPayload: any,
    issueSearchQuery: ComicVineSearchQuery,
  ) => {
    try {
      const response = await axios({
        url: `${COMICVINE_SERVICE_URI}/volumeBasedSearch`,
        method: "POST",
        data: {
          format: "json",
          // hack
          query: issueSearchQuery.inferredIssueDetails.name
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim(),
          limit: "100",
          page: 1,
          resources: "volume",
          scorerConfiguration: {
            searchParams: issueSearchQuery.inferredIssueDetails,
          },
          rawFileDetails: searchPayload,
        },
        transformResponse: (r) => {
          const matches = JSON.parse(r);
          return matches;
        },
      });
      let matches: ComicVineMatch[] = [];
      if (!isNil(response.data.results) && response.data.results.length === 1) {
        matches = response.data.results;
      } else {
        matches = response.data.map((match: ComicVineMatch) => match);
      }
      const scoredMatches = matches.sort((a: ComicVineMatch, b: ComicVineMatch) => b.score - a.score);
      setComicVineMatches(scoredMatches);
      comicvine.clearScrapingStatus();
    } catch (err) {
      // Error handling could be added here if needed
      setComicVineMatches([]);
      comicvine.clearScrapingStatus();
    }
  };

  /**
   * Prepares search query and initiates ComicVine match search.
   *
   * This function acts as the main entry point for searching ComicVine metadata.
   * It intelligently handles multiple input sources and constructs the appropriate
   * search query based on the available data, then triggers the API call.
   *
   * The function handles three distinct cases in order of priority:
   * 1. Manual override with user-provided values (highest priority)
   * 2. Parse from raw file details (filename-based parsing)
   * 3. Parse from existing ComicVine metadata (fallback)
   *
   * @param {RawFileDetailsType | undefined} rawFileDetails - Raw file details from the comic file, including filename and other metadata
   * @param {ComicVineMetadata | undefined} comicvine - Existing ComicVine metadata if available, used as fallback for search parameters
   * @param {object} [manualOverride] - User-provided search parameters that override all other sources
   * @param {string} [manualOverride.issueName] - Manual series name input from user
   * @param {string} [manualOverride.issueNumber] - Manual issue number input from user
   * @param {string} [manualOverride.issueYear] - Manual publication year input from user
   *
   * @returns {void} This function doesn't return a value but triggers state updates via fetchComicVineMatches
   *
   * @example
   * ```typescript
   * // Search using filename parsing
   * prepareAndFetchMatches(rawFileDetails);
   *
   * // Search with manual override
   * prepareAndFetchMatches(rawFileDetails, undefined, {
   *   issueName: "Batman",
   *   issueNumber: "1",
   *   issueYear: "2023"
   * });
   *
   * // Search using existing metadata as fallback
   * prepareAndFetchMatches(undefined, { name: "Superman #1 (2023)" });
   * ```
   */
  const prepareAndFetchMatches = (
    rawFileDetails: RawFileDetailsType | undefined,
    comicvine: ComicVineMetadata | undefined,
    manualOverride?: { issueName?: string; issueNumber?: string; issueYear?: string },
  ) => {
    let issueSearchQuery: ComicVineSearchQuery;

    if (manualOverride) {
      issueSearchQuery = {
        inferredIssueDetails: {
          name: manualOverride.issueName || "",
          number: manualOverride.issueNumber,
          subtitle: "",
          year: manualOverride.issueYear,
        },
      };
    } else if (!isUndefined(rawFileDetails) && rawFileDetails.name) {
      issueSearchQuery = refineQuery(rawFileDetails.name) as ComicVineSearchQuery;
    } else if (!isEmpty(comicvine) && comicvine?.name) {
      issueSearchQuery = refineQuery(comicvine.name) as ComicVineSearchQuery;
    } else {
      issueSearchQuery = { inferredIssueDetails: { name: "" } };
    }

    fetchComicVineMatches(rawFileDetails, issueSearchQuery);
  };

  return {
    comicVineMatches,
    prepareAndFetchMatches,
  };
};
