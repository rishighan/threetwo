/**
 * @fileoverview ComicVine Match Adapter
 * 
 * Transforms ComicVine API responses into the normalized match format.
 * ComicVine provides rich metadata including cover images, volume information,
 * and publisher details.
 * 
 * @module components/ComicDetail/MatchPanel/adapters/comicvineAdapter
 */

import type { NormalizedMatch, BatchMatchAdapter } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Raw ComicVine Types (from API response)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw ComicVine match structure from the volumeBasedSearch endpoint.
 * These field names use snake_case as returned by the ComicVine API.
 */
export interface RawComicVineMatch {
  /** ComicVine issue ID */
  id?: number;
  /** Issue story name/title */
  name?: string;
  /** Match confidence score (as string from API) */
  score: string | number;
  /** Issue number (as string from API) */
  issue_number: string | number;
  /** Cover/publication date */
  cover_date: string;
  /** HTML description of the issue */
  description?: string;
  /** Issue cover images */
  image: {
    thumb_url: string;
    small_url?: string;
    medium_url?: string;
  };
  /** Volume/series information */
  volume: {
    id?: number;
    name: string;
    api_detail_url?: string;
  };
  /** Extended volume information from secondary lookup */
  volumeInformation: {
    results: {
      id?: number;
      name?: string;
      start_year?: string;
      count_of_issues: number;
      image: {
        icon_url: string;
        thumb_url?: string;
      };
      publisher: {
        id?: number;
        name: string;
      };
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a single ComicVine match to the common format.
 * 
 * @param raw - Raw ComicVine match data from API
 * @returns Normalized match structure
 * 
 * @example
 * ```ts
 * const normalized = normalizeComicVineMatch(rawCVMatch);
 * console.log(normalized.issue.coverImageUrl); // "https://comicvine.gamespot.com/..."
 * ```
 */
export const normalizeComicVineMatch = (raw: RawComicVineMatch): NormalizedMatch => {
  const volumeResults = raw.volumeInformation?.results;
  
  return {
    id: `cv-${raw.id ?? raw.issue_number}`,
    source: "comicvine",
    score: typeof raw.score === "string" ? parseInt(raw.score, 10) : raw.score,
    issue: {
      title: raw.name,
      number: String(raw.issue_number),
      coverDate: raw.cover_date,
      description: raw.description,
      coverImageUrl: raw.image?.thumb_url,
    },
    series: {
      id: String(raw.volume?.id ?? ""),
      name: raw.volume?.name ?? "",
      yearBegan: volumeResults?.start_year 
        ? parseInt(volumeResults.start_year, 10) 
        : undefined,
      issueCount: volumeResults?.count_of_issues,
      coverImageUrl: volumeResults?.image?.icon_url,
      publisher: volumeResults?.publisher 
        ? { name: volumeResults.publisher.name } 
        : undefined,
    },
    // ComicVine doesn't provide extended fields like ISBN, page count, etc.
    extended: undefined,
    _raw: raw,
  };
};

/**
 * Normalizes an array of ComicVine matches.
 * Filters out any invalid matches and preserves the original sort order (by score).
 * 
 * @param rawMatches - Array of raw ComicVine matches
 * @returns Array of normalized matches
 * 
 * @example
 * ```ts
 * const matches = normalizeComicVineMatches(apiResponse.results);
 * // Use with MatchPanel
 * <MatchPanel source="comicvine" matches={matches} ... />
 * ```
 */
export const normalizeComicVineMatches: BatchMatchAdapter<RawComicVineMatch> = (
  rawMatches: RawComicVineMatch[]
): NormalizedMatch[] => {
  if (!Array.isArray(rawMatches)) {
    return [];
  }
  
  return rawMatches
    .filter((match) => match && (match.id || match.issue_number))
    .map(normalizeComicVineMatch);
};

export default normalizeComicVineMatches;
