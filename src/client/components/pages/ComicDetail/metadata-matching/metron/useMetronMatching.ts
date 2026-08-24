import { useState } from "react";
import { isUndefined, isEmpty } from "lodash";
import { refineQuery } from "filename-parser";
import { LIBRARY_SERVICE_HOST } from "../../../../../constants/endpoints";
import { RawFileDetails as RawFileDetailsType } from "../../../../../graphql/generated";
import type { MetronMatch } from "../../../../../types";
import { useStore } from "../../../../../store";

/**
 * Represents a search query structure for Metron metadata matching.
 * Contains parsed details from filename or user input for comic issue identification.
 */
type MetronSearchQuery = {
  /** Inferred details about the comic issue */
  inferredIssueDetails: {
    /** The name/title of the comic series */
    name: string;
    /** The issue number (can be string or number) */
    number?: string | number;
    /** The publication year */
    year?: string;
    /** Optional subtitle or additional descriptor */
    subtitle?: string;
  };
};

/**
 * Represents existing Metron metadata structure.
 * Used when parsing from previously stored metadata.
 */
type MetronMetadata = {
  /** The name/title from existing metadata */
  name?: string;
  /** Additional metadata properties */
  [key: string]: unknown;
};

/**
 * GraphQL query for Metron volume-based search.
 *
 * This query searches for comic issues and series in the Metron database,
 * returning scored matches based on the provided search parameters.
 * The results include both issue and series information with publisher details.
 *
 * @constant {string} METRON_VOLUME_SEARCH_QUERY - The GraphQL query string
 */
const METRON_VOLUME_SEARCH_QUERY = `
  query MetronVolumeBasedSearch($input: MetronVolumeSearchInput!) {
    metronVolumeBasedSearch(input: $input) {
      finalMatches {
        score
        nameMatchScore
        seriesMatchScore
        issue {
          id
          issueNumber
          cover_date
          image
          title
          desc
        }
        series {
          id
          name
          year_began
          issue_count
          image
          publisher {
            id
            name
          }
        }
      }
    }
  }
`;

/**
 * Hook for managing Metron metadata matching.
 *
 * This custom React hook provides functionality to search for comic metadata matches
 * using the Metron database API. It handles the parsing of file details, manual search
 * overrides, and existing metadata to construct appropriate search queries.
 *
 * The hook maintains state for matched results and provides methods to fetch new matches
 * based on different input sources (filename parsing, manual input, or existing metadata).
 *
 * @returns {object} Hook return object
 * @returns {MetronMatch[]} returns.metronMatches - Array of scored matches from Metron API, sorted by score descending
 * @returns {function} returns.prepareAndFetchMatches - Function to initiate search with various input types
 *
 * @example
 * ```typescript
 * const { metronMatches, prepareAndFetchMatches } = useMetronMatching();
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
export const useMetronMatching = () => {
  const [metronMatches, setMetronMatches] = useState<MetronMatch[]>([]);
  const { metron } = useStore();

  /**
   * Fetches matches from the Metron metronVolumeBasedSearch GraphQL query.
   *
   * This function performs the actual API call to the Metron GraphQL endpoint,
   * processes the response, handles errors, and updates the component state with
   * the sorted match results.
   *
   * @param {RawFileDetailsType | undefined} searchPayload - Raw file details to include in the request for context
   * @param {MetronSearchQuery} issueSearchQuery - Parsed search query containing series name, issue number, year, and subtitle
   *
   * @returns {Promise<void>} Resolves when the fetch operation completes
   *
   * @throws {Error} Logs errors to console if GraphQL query fails or network issues occur
   *
   * @example
   * ```typescript
   * const searchQuery = {
   *   inferredIssueDetails: {
   *     name: "Amazing Spider-Man",
   *     number: "1",
   *     year: "2023"
   *   }
   * };
   * await fetchMetronMatches(rawFileDetails, searchQuery);
   * ```
   */
  const fetchMetronMatches = async (
    searchPayload: RawFileDetailsType | undefined,
    issueSearchQuery: MetronSearchQuery
  ) => {
    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: METRON_VOLUME_SEARCH_QUERY,
          variables: {
            input: {
              scorerConfiguration: {
                searchParams: {
                  name: issueSearchQuery.inferredIssueDetails.name
                    .replace(/[^a-zA-Z0-9 ]/g, "")
                    .trim(),
                  issueNumber: String(issueSearchQuery.inferredIssueDetails.number || ""),
                  year: issueSearchQuery.inferredIssueDetails.year || "",
                  subtitle: issueSearchQuery.inferredIssueDetails.subtitle || "",
                },
              },
              rawFileDetails: searchPayload,
            },
          },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        console.error("GraphQL errors:", json.errors);
        setMetronMatches([]);
        metron.clearScrapingStatus();
        return;
      }

      const matches: MetronMatch[] = json.data?.metronVolumeBasedSearch?.finalMatches || [];
      // Sort by score descending (best matches first)
      const scoredMatches = matches.sort(
        (a: MetronMatch, b: MetronMatch) => b.score - a.score
      );
      setMetronMatches(scoredMatches);
      metron.clearScrapingStatus();
    } catch (err) {
      console.error("Error fetching Metron matches:", err);
      setMetronMatches([]);
      metron.clearScrapingStatus();
    }
  };

  /**
   * Prepares search query and initiates Metron match search.
   *
   * This function acts as the main entry point for searching Metron metadata.
   * It intelligently handles multiple input sources and constructs the appropriate
   * search query based on the available data, then triggers the API call.
   *
   * The function handles three distinct cases in order of priority:
   * 1. Manual override with user-provided values (highest priority)
   * 2. Parse from raw file details (filename-based parsing)
   * 3. Parse from existing Metron metadata (fallback)
   *
   * @param {RawFileDetailsType | undefined} rawFileDetails - Raw file details from the comic file, including filename and other metadata
   * @param {MetronMetadata} [metron] - Existing Metron metadata if available, used as fallback for search parameters
   * @param {object} [manualOverride] - User-provided search parameters that override all other sources
   * @param {string} [manualOverride.issueName] - Manual series name input from user
   * @param {string} [manualOverride.issueNumber] - Manual issue number input from user
   * @param {string} [manualOverride.issueYear] - Manual publication year input from user
   *
   * @returns {void} This function doesn't return a value but triggers state updates via fetchMetronMatches
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
    metron?: MetronMetadata,
    manualOverride?: { issueName?: string; issueNumber?: string; issueYear?: string }
  ) => {
    let issueSearchQuery: MetronSearchQuery;

    if (manualOverride) {
      // Use manual override values from the search form
      issueSearchQuery = {
        inferredIssueDetails: {
          name: manualOverride.issueName || "",
          number: manualOverride.issueNumber,
          year: manualOverride.issueYear,
          subtitle: "",
        },
      };
    } else if (!isUndefined(rawFileDetails) && rawFileDetails.name) {
      // Parse search query from the filename
      issueSearchQuery = refineQuery(rawFileDetails.name) as MetronSearchQuery;
    } else if (!isEmpty(metron) && metron?.name) {
      // Parse from existing Metron metadata name
      issueSearchQuery = refineQuery(metron.name) as MetronSearchQuery;
    } else {
      // Fallback to empty query
      issueSearchQuery = { inferredIssueDetails: { name: "" } };
    }

    fetchMetronMatches(rawFileDetails, issueSearchQuery);
  };

  return {
    metronMatches,
    prepareAndFetchMatches,
  };
};
