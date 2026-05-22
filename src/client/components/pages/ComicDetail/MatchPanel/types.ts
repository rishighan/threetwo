/**
 * @fileoverview Unified Match Panel Type Definitions
 * 
 * This module defines the normalized data structures used by the unified match panel system.
 * All metadata sources (ComicVine, GCD, Metron) are adapted to these common interfaces,
 * allowing a single set of components to render matches from any source.
 * 
 * @module components/ComicDetail/MatchPanel/types
 */

import type { QueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────────────────────
// Core Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supported metadata source identifiers.
 * Each source has its own adapter to normalize data to the common format.
 */
export type MetadataSource = 'comicvine' | 'gcd' | 'metron';

/**
 * Publisher information common to all metadata sources.
 */
export interface NormalizedPublisher {
  /** Publisher name (e.g., "Marvel Comics", "DC Comics") */
  name: string;
}

/**
 * Series/volume information normalized across all sources.
 * 
 * @example
 * ```ts
 * const series: NormalizedSeries = {
 *   id: "12345",
 *   name: "The Amazing Spider-Man",
 *   yearBegan: 1963,
 *   issueCount: 700,
 *   publisher: { name: "Marvel Comics" },
 * };
 * ```
 */
export interface NormalizedSeries {
  /** Unique identifier from the source database */
  id: string;
  /** Series/volume name */
  name: string;
  /** Sort name if different from display name (GCD-specific) */
  sortName?: string;
  /** Year the series began publication */
  yearBegan?: number;
  /** Year the series ended (if completed) */
  yearEnded?: number;
  /** Total number of issues in the series */
  issueCount?: number;
  /** URL to series cover/thumbnail image */
  coverImageUrl?: string;
  /** Publisher information */
  publisher?: NormalizedPublisher;
}

/**
 * Issue information normalized across all sources.
 * Contains only fields available from multiple sources.
 * 
 * @example
 * ```ts
 * const issue: NormalizedIssue = {
 *   title: "The Night Gwen Stacy Died",
 *   number: "121",
 *   coverDate: "1973-06",
 *   description: "One of the most pivotal stories...",
 *   coverImageUrl: "https://example.com/asm121.jpg",
 * };
 * ```
 */
export interface NormalizedIssue {
  /** Issue story title/name (optional, not all issues have titles) */
  title?: string;
  /** Issue number as displayed (e.g., "121", "1/2", "Annual 1") */
  number: string;
  /** Publication/cover date in ISO format or display format */
  coverDate?: string;
  /** Issue description, synopsis, or notes */
  description?: string;
  /** URL to issue cover thumbnail (undefined for GCD which lacks images) */
  coverImageUrl?: string;
}

/**
 * Extended metadata fields available from specific sources.
 * These fields are not universally available and are rendered conditionally.
 * 
 * Currently only GCD provides these extended fields.
 * 
 * @example
 * ```ts
 * const extended: ExtendedMatchFields = {
 *   pageCount: 32,
 *   isbn: "978-0-7851-4228-6",
 *   price: "$3.99",
 * };
 * ```
 */
export interface ExtendedMatchFields {
  /** Number of pages (GCD only) */
  pageCount?: number;
  /** ISBN for trade paperbacks/collected editions (GCD only) */
  isbn?: string;
  /** Barcode number (GCD only) */
  barcode?: string;
  /** Cover price as displayed (GCD only) */
  price?: string;
  /** Variant cover name/description (GCD only) */
  variantName?: string;
}

/**
 * Normalized match data structure that all sources adapt to.
 * 
 * This is the primary interface consumed by MatchPanel and MatchResultCard.
 * Each source's adapter transforms raw API data into this common format.
 * 
 * @example
 * ```ts
 * const match: NormalizedMatch = {
 *   id: "cv-456789",
 *   source: "comicvine",
 *   score: 95,
 *   issue: { ... },
 *   series: { ... },
 *   _raw: originalApiResponse,
 * };
 * ```
 */
export interface NormalizedMatch {
  /** Unique identifier (prefixed with source for disambiguation) */
  id: string;
  /** Source this match came from */
  source: MetadataSource;
  /** Match confidence score (0-100, higher is better) */
  score: number;
  /** Normalized issue information */
  issue: NormalizedIssue;
  /** Normalized series/volume information */
  series: NormalizedSeries;
  /** Optional extended fields (source-specific) */
  extended?: ExtendedMatchFields;
  /** 
   * Original raw data from the source API.
   * Preserved for the apply mutation which needs source-specific IDs.
   * @internal
   */
  _raw: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for a metadata source's display and behavior.
 * Used by useMatchSource hook to provide source-specific settings.
 */
export interface SourceConfig {
  /** Human-readable source name (e.g., "ComicVine", "Grand Comics Database") */
  displayName: string;
  /** Short identifier (e.g., "CV", "GCD", "Metron") */
  shortName: string;
  /** Icon class for the source (Iconify format) */
  iconClass: string;
  /** Status message shown when no matches found */
  emptyMessage: string;
  /** Accent color class for source branding */
  accentColor: string;
}

/**
 * Props for the unified MatchPanel component.
 * 
 * @example
 * ```tsx
 * <MatchPanel
 *   source="gcd"
 *   matches={normalizedMatches}
 *   comicObjectId="abc123"
 *   queryClient={queryClient}
 *   onMatchApplied={handleClose}
 *   isLoading={isSearching}
 * />
 * ```
 */
export interface MatchPanelProps {
  /** Metadata source identifier */
  source: MetadataSource;
  /** Array of normalized match results */
  matches: NormalizedMatch[];
  /** MongoDB ObjectId of the comic being matched */
  comicObjectId: string;
  /** React Query client for cache invalidation */
  queryClient: QueryClient;
  /** Callback fired after a match is successfully applied */
  onMatchApplied: () => void;
  /** Whether a search is currently in progress */
  isLoading?: boolean;
  /** Error message if the search failed */
  error?: string | null;
}

/**
 * Props for the MatchResultCard component.
 */
export interface MatchResultCardProps {
  /** Normalized match data to display */
  match: NormalizedMatch;
  /** Whether this is the top/best match (affects styling) */
  isBestMatch: boolean;
  /** MongoDB ObjectId of the comic being matched */
  comicObjectId: string;
  /** React Query client for cache invalidation */
  queryClient: QueryClient;
  /** Callback fired after a match is successfully applied */
  onMatchApplied: () => void;
}

/**
 * Common search form values used by all sources.
 * Field names are intentionally generic to support different source terminology.
 */
export interface SearchFormValues {
  /** Issue/series name to search for */
  issueName?: string;
  /** Issue number to filter by */
  issueNumber?: string;
  /** Publication year to filter by */
  issueYear?: string;
}

/**
 * Props for the unified search form component.
 */
export interface MatchSearchFormProps {
  /** Metadata source (affects labels and placeholder text) */
  source: MetadataSource;
  /** Callback fired when form is submitted */
  onSearch: (values: SearchFormValues) => void;
  /** Initial form values (optional) */
  initialValues?: SearchFormValues;
}

/**
 * Props for the collapsible search form wrapper.
 */
export interface CollapsibleSearchFormProps {
  /** Metadata source to display in the form */
  source: MetadataSource;
  /** Callback fired when search is submitted */
  onSearch: (values: SearchFormValues) => void;
  /** Initial form values (optional) */
  initialValues?: SearchFormValues;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return type for the useApplyMatch hook.
 */
export interface UseApplyMatchReturn {
  /** Function to apply a match to a comic */
  applyMatch: (match: NormalizedMatch, comicObjectId: string) => Promise<void>;
  /** Whether an apply operation is in progress */
  isPending: boolean;
  /** Error from the last apply attempt */
  error: Error | null;
}

/**
 * Adapter function signature for normalizing source-specific data.
 * Each source implements this to convert raw API responses to NormalizedMatch.
 * 
 * @typeParam T - The raw data type from the source API
 */
export type MatchAdapter<T> = (raw: T) => NormalizedMatch;

/**
 * Batch adapter function for normalizing arrays of matches.
 * 
 * @typeParam T - The raw data type from the source API
 */
export type BatchMatchAdapter<T> = (rawMatches: T[]) => NormalizedMatch[];
