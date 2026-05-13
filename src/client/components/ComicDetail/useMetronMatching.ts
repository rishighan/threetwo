import { useState } from "react";
import { isUndefined, isEmpty } from "lodash";
import { refineQuery } from "filename-parser";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { RawFileDetails as RawFileDetailsType } from "../../graphql/generated";
import type { MetronMatch } from "../../types";

type MetronSearchQuery = {
  inferredIssueDetails: {
    name: string;
    number?: string | number;
    year?: string;
    subtitle?: string;
  };
};

type MetronMetadata = {
  name?: string;
  [key: string]: unknown;
};

/**
 * GraphQL query for Metron volume-based search
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
 * Fetches and scores potential matches from the Metron GraphQL API based on
 * raw file details or manual search parameters.
 *
 * @returns Object containing metronMatches array and prepareAndFetchMatches function
 */
export const useMetronMatching = () => {
  const [metronMatches, setMetronMatches] = useState<MetronMatch[]>([]);

  /**
   * Fetches matches from the Metron metronVolumeBasedSearch GraphQL query.
   *
   * @param searchPayload - Raw file details to include in the request
   * @param issueSearchQuery - Parsed search query with series name, issue number, year
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
        return;
      }

      const matches: MetronMatch[] = json.data?.metronVolumeBasedSearch?.finalMatches || [];
      // Sort by score descending (best matches first)
      const scoredMatches = matches.sort(
        (a: MetronMatch, b: MetronMatch) => b.score - a.score
      );
      setMetronMatches(scoredMatches);
    } catch (err) {
      console.error("Error fetching Metron matches:", err);
      setMetronMatches([]);
    }
  };

  /**
   * Prepares search query and initiates Metron match search.
   * Handles three cases:
   * 1. Manual override with user-provided values
   * 2. Parse from raw file details (filename)
   * 3. Parse from existing Metron metadata
   *
   * @param rawFileDetails - Raw file details from the comic
   * @param metron - Existing Metron metadata if available
   * @param manualOverride - User-provided search parameters for manual search
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
