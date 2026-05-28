import { useState } from "react";
import { isUndefined, isEmpty } from "lodash";
import { refineQuery } from "filename-parser";
import { LIBRARY_SERVICE_HOST } from "../../../../../constants/endpoints";
import { RawFileDetails as RawFileDetailsType } from "../../../../../graphql/generated";
import type {
  ScoredGCDMatch,
  GCDVolumeSearchInput,
} from "../../../../../graphql/gcd.types";
import { useStore } from "../../../../../store";

/**
 * Represents a search query structure for GCD metadata matching.
 * Contains parsed details from filename or user input for comic issue identification.
 */
type GCDSearchQuery = {
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
 * Represents existing GCD metadata structure.
 * Used when parsing from previously stored metadata.
 */
type GCDMetadata = {
  /** The name/title from existing metadata */
  name?: string;
  /** Additional metadata properties */
  [key: string]: unknown;
};

/**
 * GraphQL query for GCD volume-based search.
 *
 * This query searches for comic issues and series in the GCD (Grand Comics Database),
 * returning scored matches based on the provided search parameters.
 * The results include both issue and series information with publisher details.
 *
 * Note: GCD schema now uses camelCase field names
 *
 * @constant {string} GCD_VOLUME_SEARCH_QUERY - The GraphQL query string
 */
const GCD_VOLUME_SEARCH_QUERY = `
  query GCDVolumeBasedSearch($input: GCDVolumeSearchInput!) {
    gcdVolumeBasedSearch(input: $input) {
      finalMatches {
        score
        nameMatchScore
        yearMatchScore
        issue {
          id
          issueNumber
          title
          publicationDate
          keyDate
          price
          pageCount
          isbn
          barcode
          notes
          variantName
          variantOfId
          series {
            id
            name
            yearBegan
            publisher {
              id
              name
            }
          }
        }
        series {
          id
          name
          sortName
          yearBegan
          yearEnded
          issueCount
          publisher {
            id
            name
            countryId
          }
          notes
        }
      }
      rawFileDetails
      scorerConfiguration
    }
  }
`;

/**
 * GraphQL query for GCD health check.
 *
 * This query checks the health and status of the GCD service,
 * including database connectivity and record counts.
 *
 * @constant {string} GCD_HEALTH_QUERY - The GraphQL query string
 */
const GCD_HEALTH_QUERY = `
  query GCDHealth {
    gcdHealth {
      status
      database {
        connected
        seriesCount
        issueCount
        storyCount
        publisherCount
      }
      lastUpdated
      message
    }
  }
`;

/**
 * GraphQL query for getting stories for a GCD issue.
 *
 * This query fetches detailed story information associated with a specific issue,
 * including creative credits, character information, and story content details.
 *
 * @constant {string} GCD_STORIES_QUERY - The GraphQL query string
 */
const GCD_STORIES_QUERY = `
  query GetGCDStoriesForIssue($issueId: Int!) {
    getGCDStoriesForIssue(issueId: $issueId) {
      id
      title
      feature
      typeId
      pageCount
      script
      pencils
      inks
      colors
      letters
      editing
      characters
      synopsis
      notes
    }
  }
`;

/**
 * GraphQL query for searching GCD series.
 *
 * This query searches for comic series in the GCD database based on
 * various criteria like name, publisher, and year.
 *
 * @constant {string} GCD_SEARCH_SERIES_QUERY - The GraphQL query string
 */
const GCD_SEARCH_SERIES_QUERY = `
  query SearchGCDSeries($input: GCDSeriesSearchInput!) {
    searchGCDSeries(input: $input) {
      count
      results {
        id
        name
        sortName
        yearBegan
        yearEnded
        issueCount
        publisher {
          id
          name
          countryId
        }
        notes
      }
      hasMore
      nextOffset
    }
  }
`;

/**
 * GraphQL query for getting a GCD series by ID.
 *
 * This query fetches detailed information for a specific series
 * including publisher and publication details.
 *
 * @constant {string} GCD_GET_SERIES_QUERY - The GraphQL query string
 */
const GCD_GET_SERIES_QUERY = `
  query GetGCDSeriesById($id: Int!) {
    getGCDSeriesById(id: $id) {
      id
      name
      sortName
      yearBegan
      yearEnded
      issueCount
      publisher {
        id
        name
        countryId
        yearBegan
        yearEnded
        url
      }
      notes
    }
  }
`;

/**
 * GraphQL query for searching GCD issues.
 *
 * This query searches for comic issues in the GCD database based on
 * various criteria like series, issue number, and publication dates.
 *
 * @constant {string} GCD_SEARCH_ISSUES_QUERY - The GraphQL query string
 */
const GCD_SEARCH_ISSUES_QUERY = `
  query SearchGCDIssues($input: GCDIssueSearchInput!) {
    searchGCDIssues(input: $input) {
      count
      results {
        id
        issueNumber
        publicationDate
        keyDate
        price
        pageCount
        isbn
        barcode
        notes
        variantName
        series {
          id
          name
          yearBegan
          publisher {
            id
            name
          }
        }
      }
      hasMore
      nextOffset
    }
  }
`;

/**
 * GraphQL query for getting a GCD issue by ID.
 *
 * This query fetches detailed information for a specific issue
 * including series and publisher details.
 *
 * @constant {string} GCD_GET_ISSUE_QUERY - The GraphQL query string
 */
const GCD_GET_ISSUE_QUERY = `
  query GetGCDIssueById($id: Int!) {
    getGCDIssueById(id: $id) {
      id
      issueNumber
      publicationDate
      keyDate
      price
      pageCount
      isbn
      barcode
      notes
      variantName
      series {
        id
        name
        yearBegan
        publisher {
          id
          name
        }
      }
    }
  }
`;

/**
 * Hook for managing GCD (Grand Comics Database) metadata matching.
 *
 * This custom React hook provides functionality to search for comic metadata matches
 * using the GCD GraphQL API service. It handles the parsing of file details, manual search
 * overrides, and existing metadata to construct appropriate search queries.
 *
 * The hook maintains state for matched results and provides methods to fetch new matches
 * based on different input sources (filename parsing, manual input, or existing metadata).
 *
 * NOTE: This hook requires the GCD service to be deployed. If the service
 * is not available, it will return a friendly error message.
 *
 * @returns {object} Hook return object
 * @returns {ScoredGCDMatch[]} returns.gcdMatches - Array of scored matches from GCD API, sorted by score descending
 * @returns {boolean} returns.isLoading - Loading state indicator
 * @returns {string | null} returns.error - Error message if any occurred
 * @returns {function} returns.prepareAndFetchMatches - Function to initiate search with various input types
 * @returns {function} returns.clearMatches - Function to clear current matches and errors
 *
 * @example
 * ```typescript
 * const { gcdMatches, isLoading, error, prepareAndFetchMatches } = useGCDMatching();
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
export const useGCDMatching = () => {
  const [gcdMatches, setGcdMatches] = useState<ScoredGCDMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);

  // Get the clearScrapingStatus function from the store
  const clearScrapingStatus = useStore((state) => state.gcd.clearScrapingStatus);

  /**
   * Fetches matches from the GCD gcdVolumeBasedSearch GraphQL query.
   *
   * @param searchPayload - Raw file details to include in the request
   * @param issueSearchQuery - Parsed search query with series name, issue number, year
   */
  const fetchGCDMatches = async (
    searchPayload: RawFileDetailsType | undefined,
    issueSearchQuery: GCDSearchQuery
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const input: GCDVolumeSearchInput = {
        scorerConfiguration: {
          searchParams: {
            name: issueSearchQuery.inferredIssueDetails.name
              .replace(/[^a-zA-Z0-9 ]/g, "")
              .trim(),
            issueNumber: String(
              issueSearchQuery.inferredIssueDetails.number || ""
            ),
            year: issueSearchQuery.inferredIssueDetails.year || "",
            subtitle: issueSearchQuery.inferredIssueDetails.subtitle || "",
          },
        },
        rawFileDetails: searchPayload as Record<string, unknown> | null,
      };

      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GCD_VOLUME_SEARCH_QUERY,
          variables: { input },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        console.error("GraphQL errors:", json.errors);
        // Check if the error is because GCD service isn't deployed
        const errorMessage = json.errors[0]?.message || "";
        if (
          errorMessage.includes("Unknown type") ||
          errorMessage.includes("Cannot query field") ||
          errorMessage.includes("gcdVolumeBasedSearch")
        ) {
          setIsServiceAvailable(false);
          setError(
            "GCD service is not yet available. The Grand Comics Database integration is coming soon."
          );
        } else {
          setError(errorMessage || "Error fetching GCD matches");
        }
        setGcdMatches([]);
        // Clear scraping status when error occurs
        clearScrapingStatus();
        return;
      }

      setIsServiceAvailable(true);
      const matches: ScoredGCDMatch[] =
        json.data?.gcdVolumeBasedSearch?.finalMatches || [];
      // Sort by score descending (best matches first)
      const scoredMatches = matches.sort(
        (a: ScoredGCDMatch, b: ScoredGCDMatch) => b.score - a.score
      );
      setGcdMatches(scoredMatches);
      // Clear scraping status when matches are received
      clearScrapingStatus();
    } catch (err) {
      console.error("Error fetching GCD matches:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setGcdMatches([]);
      // Clear scraping status when error occurs
      clearScrapingStatus();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Prepares search query and initiates GCD match search.
   * Handles three cases:
   * 1. Manual override with user-provided values
   * 2. Parse from raw file details (filename)
   * 3. Parse from existing GCD metadata
   *
   * @param rawFileDetails - Raw file details from the comic
   * @param gcd - Existing GCD metadata if available
   * @param manualOverride - User-provided search parameters for manual search
   */
  const prepareAndFetchMatches = (
    rawFileDetails: RawFileDetailsType | undefined,
    gcd?: GCDMetadata,
    manualOverride?: {
      issueName?: string;
      issueNumber?: string;
      issueYear?: string;
    }
  ) => {
    let issueSearchQuery: GCDSearchQuery;

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
      issueSearchQuery = refineQuery(rawFileDetails.name) as GCDSearchQuery;
    } else if (!isEmpty(gcd) && gcd?.name) {
      // Parse from existing GCD metadata name
      issueSearchQuery = refineQuery(gcd.name) as GCDSearchQuery;
    } else {
      // Fallback to empty query
      issueSearchQuery = { inferredIssueDetails: { name: "" } };
    }

    fetchGCDMatches(rawFileDetails, issueSearchQuery);
  };

  /**
   * Clears the current GCD matches
   */
  const clearMatches = () => {
    setGcdMatches([]);
    setError(null);
  };

  return {
    gcdMatches,
    isLoading,
    error,
    prepareAndFetchMatches,
    clearMatches,
  };
};

/**
 * Hook for checking GCD service health status
 */
export const useGCDHealth = () => {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    connected: boolean;
    message?: string;
    counts?: {
      series: number;
      issues: number;
      stories: number;
      publishers: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GCD_HEALTH_QUERY,
        }),
      });

      const json = await response.json();

      if (json.errors) {
        setHealthStatus({
          status: "error",
          connected: false,
          message: json.errors[0]?.message,
        });
        return;
      }

      const health = json.data?.gcdHealth;
      setHealthStatus({
        status: health?.status || "unknown",
        connected: health?.database?.connected || false,
        message: health?.message,
        counts: {
          series: health?.database?.seriesCount || 0,
          issues: health?.database?.issueCount || 0,
          stories: health?.database?.storyCount || 0,
          publishers: health?.database?.publisherCount || 0,
        },
      });
    } catch (err) {
      setHealthStatus({
        status: "error",
        connected: false,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    healthStatus,
    isLoading,
    checkHealth,
  };
};

/**
 * Hook for fetching stories for a GCD issue
 */
export const useGCDStories = () => {
  const [stories, setStories] = useState<
    Array<{
      id: number;
      title?: string;
      feature?: string;
      type?: string;
      pageCount?: number;
      script?: string;
      pencils?: string;
      inks?: string;
      colors?: string;
      letters?: string;
      editing?: string;
      characters?: string;
      synopsis?: string;
      notes?: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async (issueId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GCD_STORIES_QUERY,
          variables: { issueId },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        setError(json.errors[0]?.message || "Error fetching GCD stories");
        setStories([]);
        return;
      }

      setStories(json.data?.getGCDStoriesForIssue || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stories,
    isLoading,
    error,
    fetchStories,
  };
};

/**
 * Hook for searching GCD series
 */
export const useGCDSeriesSearch = () => {
  const [series, setSeries] = useState<
    Array<{
      id: number;
      name: string;
      sortName?: string;
      yearBegan?: number;
      yearEnded?: number;
      issueCount?: number;
      publisher?: {
        id: number;
        name: string;
        country?: string;
      };
      country?: string;
      language?: string;
      format?: string;
      notes?: string;
    }>
  >([]);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSeries = async (input: {
    name: string;
    publisherName?: string;
    yearBegan?: number;
    language?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GCD_SEARCH_SERIES_QUERY,
          variables: { input },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        setError(json.errors[0]?.message || "Error searching GCD series");
        setSeries([]);
        return;
      }

      const result = json.data?.searchGCDSeries;
      setSeries(result?.results || []);
      setCount(result?.count || 0);
      setHasMore(result?.hasMore || false);
      setNextOffset(result?.nextOffset || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSeries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setSeries([]);
    setCount(0);
    setHasMore(false);
    setNextOffset(null);
    setError(null);
  };

  return {
    series,
    count,
    hasMore,
    nextOffset,
    isLoading,
    error,
    searchSeries,
    clearResults,
  };
};

/**
 * Hook for fetching a GCD series by ID
 */
export const useGCDSeries = () => {
  const [series, setSeries] = useState<{
    id: number;
    name: string;
    sortName?: string;
    yearBegan?: number;
    yearEnded?: number;
    issueCount?: number;
    publisher?: {
      id: number;
      name: string;
      country?: string;
      yearBegan?: number;
      yearEnded?: number;
      url?: string;
    };
    country?: string;
    language?: string;
    format?: string;
    notes?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeries = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GCD_GET_SERIES_QUERY,
          variables: { id },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        setError(json.errors[0]?.message || "Error fetching GCD series");
        setSeries(null);
        return;
      }

      setSeries(json.data?.getGCDSeriesById || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSeries(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    series,
    isLoading,
    error,
    fetchSeries,
  };
};

/**
 * Hook for searching GCD issues
 */
export const useGCDIssueSearch = () => {
  const [issues, setIssues] = useState<
    Array<{
      id: number;
      number?: string;
      title?: string;
      publicationDate?: string;
      keyDate?: string;
      price?: string;
      pageCount?: number;
      isbn?: string;
      barcode?: string;
      notes?: string;
      coverUrl?: string;
      series?: {
        id: number;
        name: string;
        yearBegan?: number;
        publisher?: {
          id: number;
          name: string;
        };
      };
    }>
  >([]);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchIssues = async (input: {
    seriesId?: number;
    number?: string;
    publicationDateStart?: string;
    publicationDateEnd?: string;
    isbn?: string;
    barcode?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GCD_SEARCH_ISSUES_QUERY,
          variables: { input },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        setError(json.errors[0]?.message || "Error searching GCD issues");
        setIssues([]);
        return;
      }

      const result = json.data?.searchGCDIssues;
      setIssues(result?.results || []);
      setCount(result?.count || 0);
      setHasMore(result?.hasMore || false);
      setNextOffset(result?.nextOffset || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setIssues([]);
    setCount(0);
    setHasMore(false);
    setNextOffset(null);
    setError(null);
  };

  return {
    issues,
    count,
    hasMore,
    nextOffset,
    isLoading,
    error,
    searchIssues,
    clearResults,
  };
};

/**
 * Hook for fetching a GCD issue by ID
 */
export const useGCDIssue = () => {
  const [issue, setIssue] = useState<{
    id: number;
    number?: string;
    title?: string;
    publicationDate?: string;
    keyDate?: string;
    price?: string;
    pageCount?: number;
    isbn?: string;
    barcode?: string;
    notes?: string;
    coverUrl?: string;
    series?: {
      id: number;
      name: string;
      yearBegan?: number;
      publisher?: {
        id: number;
        name: string;
      };
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssue = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GCD_GET_ISSUE_QUERY,
          variables: { id },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        setError(json.errors[0]?.message || "Error fetching GCD issue");
        setIssue(null);
        return;
      }

      setIssue(json.data?.getGCDIssueById || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIssue(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    issue,
    isLoading,
    error,
    fetchIssue,
  };
};

export {
  GCD_VOLUME_SEARCH_QUERY,
  GCD_HEALTH_QUERY,
  GCD_STORIES_QUERY,
  GCD_SEARCH_SERIES_QUERY,
  GCD_GET_SERIES_QUERY,
  GCD_SEARCH_ISSUES_QUERY,
  GCD_GET_ISSUE_QUERY,
};
