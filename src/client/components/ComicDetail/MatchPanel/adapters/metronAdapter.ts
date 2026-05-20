/**
 * @fileoverview Metron Match Adapter
 * 
 * Transforms Metron API responses into the normalized match format.
 * Metron provides quality metadata including cover images, issue descriptions,
 * and comprehensive series information.
 * 
 * @module components/ComicDetail/MatchPanel/adapters/metronAdapter
 */

import type { NormalizedMatch, BatchMatchAdapter } from "../types";
import type { MetronMatch } from "../../../../types/comic.types";

// ─────────────────────────────────────────────────────────────────────────────
// Adapter Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a single Metron match to the common format.
 * 
 * Metron uses a mix of snake_case (year_began, cover_date) and camelCase
 * (issueNumber) field names. This adapter handles both consistently.
 * 
 * @param raw - Metron match from the volumeBasedSearch endpoint
 * @returns Normalized match structure
 * 
 * @example
 * ```ts
 * const normalized = normalizeMetronMatch(metronMatch);
 * console.log(normalized.issue.coverImageUrl); // "https://metron.cloud/..."
 * ```
 */
export const normalizeMetronMatch = (raw: MetronMatch): NormalizedMatch => {
  const { issue, series, score } = raw;
  
  return {
    id: `metron-${issue.id}`,
    source: "metron",
    score: Math.round(score),
    issue: {
      title: issue.name,
      number: issue.issueNumber,
      coverDate: issue.cover_date,
      description: issue.desc,
      coverImageUrl: issue.image,
    },
    series: {
      id: String(series.id),
      name: series.name,
      sortName: series.sort_name,
      yearBegan: series.year_began,
      yearEnded: series.year_end ?? undefined,
      issueCount: series.issue_count,
      coverImageUrl: series.image,
      publisher: series.publisher 
        ? { name: series.publisher.name } 
        : undefined,
    },
    // Metron doesn't provide extended fields like ISBN, page count, etc.
    extended: undefined,
    _raw: raw,
  };
};

/**
 * Normalizes an array of Metron matches.
 * Filters out any invalid matches and preserves the original sort order (by score).
 * 
 * @param rawMatches - Array of Metron matches from the API
 * @returns Array of normalized matches
 * 
 * @example
 * ```ts
 * const matches = normalizeMetronMatches(apiResponse.finalMatches);
 * // Use with MatchPanel
 * <MatchPanel source="metron" matches={matches} ... />
 * ```
 */
export const normalizeMetronMatches: BatchMatchAdapter<MetronMatch> = (
  rawMatches: MetronMatch[]
): NormalizedMatch[] => {
  if (!Array.isArray(rawMatches)) {
    return [];
  }
  
  return rawMatches
    .filter((match) => match?.issue?.id != null && match?.series?.id != null)
    .map(normalizeMetronMatch);
};

export default normalizeMetronMatches;
