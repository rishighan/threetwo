/**
 * @fileoverview GCD (Grand Comics Database) Match Adapter
 * 
 * Transforms GCD search results into the normalized match format.
 * GCD provides comprehensive metadata including detailed credits and publication
 * information, but does not include cover images.
 * 
 * GCD is the only source that provides extended fields like ISBN, barcode,
 * page count, and price.
 * 
 * @module components/ComicDetail/MatchPanel/adapters/gcdAdapter
 */

import type { NormalizedMatch, BatchMatchAdapter } from "../types";
import type { ScoredGCDMatch } from "../../../../../graphql/gcd.types";

// ─────────────────────────────────────────────────────────────────────────────
// Adapter Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a single GCD match to the common format.
 * 
 * GCD uses camelCase field names in its GraphQL schema, which differs from
 * ComicVine's snake_case. This adapter handles the transformation.
 * 
 * @param raw - Scored GCD match from the volumeBasedSearch query
 * @returns Normalized match structure with extended fields populated
 * 
 * @example
 * ```ts
 * const normalized = normalizeGCDMatch(scoredMatch);
 * console.log(normalized.extended?.isbn); // "978-0-7851-4228-6"
 * console.log(normalized.issue.coverImageUrl); // undefined (GCD lacks images)
 * ```
 */
export const normalizeGCDMatch = (raw: ScoredGCDMatch): NormalizedMatch => {
  const { issue, series, score } = raw;
  
  // Build extended fields object, only including non-null values
  const extended: NormalizedMatch["extended"] = {};
  let hasExtended = false;
  
  if (issue.pageCount != null) {
    extended.pageCount = issue.pageCount;
    hasExtended = true;
  }
  if (issue.isbn) {
    extended.isbn = issue.isbn;
    hasExtended = true;
  }
  if (issue.barcode) {
    extended.barcode = issue.barcode;
    hasExtended = true;
  }
  if (issue.price) {
    extended.price = issue.price;
    hasExtended = true;
  }
  if (issue.variantName) {
    extended.variantName = issue.variantName;
    hasExtended = true;
  }
  
  return {
    id: `gcd-${issue.id}`,
    source: "gcd",
    score: Math.round(score),
    issue: {
      // GCD issues don't have story titles at the issue level
      title: undefined,
      number: issue.issueNumber ?? "",
      coverDate: issue.publicationDate ?? undefined,
      description: issue.notes ?? undefined,
      // GCD does not provide cover images
      coverImageUrl: undefined,
    },
    series: {
      id: String(series.id),
      name: series.name,
      sortName: series.sortName ?? undefined,
      yearBegan: series.yearBegan ?? undefined,
      yearEnded: series.yearEnded ?? undefined,
      issueCount: series.issueCount ?? undefined,
      // GCD does not provide series images
      coverImageUrl: undefined,
      publisher: series.publisher 
        ? { name: series.publisher.name } 
        : undefined,
    },
    extended: hasExtended ? extended : undefined,
    _raw: raw,
  };
};

/**
 * Normalizes an array of GCD matches.
 * Filters out any invalid matches and preserves the original sort order (by score).
 * 
 * @param rawMatches - Array of scored GCD matches from GraphQL query
 * @returns Array of normalized matches
 * 
 * @example
 * ```ts
 * const matches = normalizeGCDMatches(queryResult.gcdVolumeBasedSearch.finalMatches);
 * // Use with MatchPanel
 * <MatchPanel source="gcd" matches={matches} ... />
 * ```
 */
export const normalizeGCDMatches: BatchMatchAdapter<ScoredGCDMatch> = (
  rawMatches: ScoredGCDMatch[]
): NormalizedMatch[] => {
  if (!Array.isArray(rawMatches)) {
    return [];
  }
  
  return rawMatches
    .filter((match) => match?.issue?.id != null && match?.series?.id != null)
    .map(normalizeGCDMatch);
};

export default normalizeGCDMatches;
