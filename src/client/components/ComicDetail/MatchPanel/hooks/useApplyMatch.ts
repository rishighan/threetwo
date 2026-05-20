/**
 * @fileoverview useApplyMatch Hook
 * 
 * Unified hook for applying metadata matches to comics from any source.
 * Handles the API calls for ComicVine (REST), GCD (GraphQL), and Metron (GraphQL),
 * providing a consistent interface for all sources.
 * 
 * @module components/ComicDetail/MatchPanel/hooks/useApplyMatch
 */

import { useState, useCallback } from "react";
import axios from "axios";
import type { MetadataSource, NormalizedMatch, UseApplyMatchReturn } from "../types";
import type { RawComicVineMatch } from "../adapters/comicvineAdapter";
import type { ScoredGCDMatch } from "../../../../graphql/gcd.types";
import type { MetronMatch } from "../../../../types/comic.types";
import { LIBRARY_SERVICE_BASE_URI, LIBRARY_SERVICE_HOST } from "../../../../constants/endpoints";

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GraphQL mutation for applying GCD metadata to a comic.
 * Updates the comic's sourcedMetadata.gcd field.
 */
const APPLY_GCD_METADATA_MUTATION = `
  mutation ApplyGCDMetadata($input: ApplyGCDMetadataInput!) {
    applyGCDMetadata(input: $input) {
      success
      message
      comicObjectId
      updatedAt
    }
  }
`;

/**
 * GraphQL mutation for applying Metron metadata to a comic.
 * Updates the comic's sourcedMetadata.metron field.
 */
const APPLY_METRON_METADATA_MUTATION = `
  mutation ApplyMetronMetadata($input: ApplyMetronMetadataInput!) {
    applyMetronMetadata(input: $input) {
      success
      message
      comicObjectId
      updatedAt
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Source-Specific Apply Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applies a ComicVine match via REST API.
 * 
 * @param match - The raw ComicVine match data
 * @param comicObjectId - MongoDB ObjectId of the comic
 * @throws Error if the API call fails
 */
const applyComicVineMatch = async (
  match: RawComicVineMatch,
  comicObjectId: string
): Promise<void> => {
  const response = await axios.request({
    url: `${LIBRARY_SERVICE_BASE_URI}/applyComicVineMetadata`,
    method: "POST",
    data: {
      match,
      comicObjectId,
    },
  });
  
  if (response.status !== 200) {
    throw new Error(`Failed to apply ComicVine metadata: ${response.statusText}`);
  }
};

/**
 * Applies a GCD match via GraphQL mutation.
 * 
 * @param match - The raw GCD scored match data
 * @param comicObjectId - MongoDB ObjectId of the comic
 * @throws Error if the GraphQL mutation returns errors
 */
const applyGCDMatch = async (
  match: ScoredGCDMatch,
  comicObjectId: string
): Promise<void> => {
  const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: APPLY_GCD_METADATA_MUTATION,
      variables: {
        input: {
          comicObjectId,
          gcdIssueId: match.issue.id,
          gcdSeriesId: match.series.id,
        },
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || "Failed to apply GCD metadata");
  }
};

/**
 * Applies a Metron match via GraphQL mutation.
 * 
 * @param match - The raw Metron match data
 * @param comicObjectId - MongoDB ObjectId of the comic
 * @throws Error if the GraphQL mutation returns errors
 */
const applyMetronMatch = async (
  match: MetronMatch,
  comicObjectId: string
): Promise<void> => {
  const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: APPLY_METRON_METADATA_MUTATION,
      variables: {
        input: {
          comicObjectId,
          metronIssueId: match.issue.id,
          metronSeriesId: match.series.id,
        },
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || "Failed to apply Metron metadata");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for applying a metadata match to a comic.
 * 
 * Provides a unified interface for applying matches from any source.
 * Manages loading state and error handling internally.
 * 
 * @param source - Metadata source identifier (determines which API to call)
 * @returns Object with applyMatch function, isPending state, and error
 * 
 * @example
 * ```tsx
 * const { applyMatch, isPending, error } = useApplyMatch("gcd");
 * 
 * const handleApply = async () => {
 *   try {
 *     await applyMatch(normalizedMatch, comicObjectId);
 *     // Success - close panel, refresh data, etc.
 *   } catch (err) {
 *     // Error is also available via the error state
 *     console.error("Failed to apply match:", err);
 *   }
 * };
 * ```
 */
export const useApplyMatch = (source: MetadataSource): UseApplyMatchReturn => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const applyMatch = useCallback(async (
    match: NormalizedMatch,
    comicObjectId: string
  ): Promise<void> => {
    setIsPending(true);
    setError(null);
    
    try {
      // The _raw field contains the original API response needed for the mutation
      const rawData = match._raw;
      
      switch (source) {
        case "comicvine":
          await applyComicVineMatch(rawData as RawComicVineMatch, comicObjectId);
          break;
          
        case "gcd":
          await applyGCDMatch(rawData as ScoredGCDMatch, comicObjectId);
          break;
          
        case "metron":
          await applyMetronMatch(rawData as MetronMatch, comicObjectId);
          break;
          
        default:
          throw new Error(`Unknown metadata source: ${source}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [source]);

  return { applyMatch, isPending, error };
};

export default useApplyMatch;
