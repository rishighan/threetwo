/**
 * @fileoverview Unified Match Panel - Barrel Exports
 * 
 * Main entry point for the unified match panel system.
 * This module provides a consistent interface for displaying and applying
 * metadata matches from any supported source (ComicVine, GCD, Metron).
 * 
 * @module components/ComicDetail/MatchPanel
 * 
 * @example Basic Usage
 * ```tsx
 * import { MatchPanel, normalizeGCDMatches } from "./MatchPanel";
 * 
 * <MatchPanel
 *   source="gcd"
 *   matches={normalizeGCDMatches(rawMatches)}
 *   comicObjectId={comic._id}
 *   queryClient={queryClient}
 *   onMatchApplied={() => closePanel()}
 * />
 * ```
 * 
 * @example With Collapsible Search
 * ```tsx
 * import { 
 *   MatchPanel, 
 *   CollapsibleSearchForm, 
 *   normalizeComicVineMatches 
 * } from "./MatchPanel";
 * 
 * <>
 *   <CollapsibleSearchForm
 *     source="comicvine"
 *     onSearch={handleManualSearch}
 *   />
 *   <MatchPanel
 *     source="comicvine"
 *     matches={normalizeComicVineMatches(cvMatches)}
 *     // ... other props
 *   />
 * </>
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

export { MatchPanel } from "./MatchPanel";
export { MatchResultCard } from "./MatchResultCard";
export { MatchSearchForm } from "./MatchSearchForm";
export { CollapsibleSearchForm } from "./CollapsibleSearchForm";

// ─────────────────────────────────────────────────────────────────────────────
// Adapters
// ─────────────────────────────────────────────────────────────────────────────

export {
  normalizeComicVineMatch,
  normalizeComicVineMatches,
  normalizeGCDMatch,
  normalizeGCDMatches,
  normalizeMetronMatch,
  normalizeMetronMatches,
  type RawComicVineMatch,
} from "./adapters";

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

export { 
  useMatchSource, 
  getSourceConfig,
  useApplyMatch,
} from "./hooks";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type {
  MetadataSource,
  NormalizedMatch,
  NormalizedIssue,
  NormalizedSeries,
  NormalizedPublisher,
  ExtendedMatchFields,
  SourceConfig,
  MatchPanelProps,
  MatchResultCardProps,
  SearchFormValues,
  MatchSearchFormProps,
  CollapsibleSearchFormProps,
  UseApplyMatchReturn,
  MatchAdapter,
  BatchMatchAdapter,
} from "./types";
