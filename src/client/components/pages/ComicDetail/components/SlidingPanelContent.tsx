/**
 * @fileoverview Sliding Panel Content Components
 * 
 * Provides pre-configured panel contents for the comic detail sliding panels.
 * Uses the unified MatchPanel system for all metadata sources.
 * 
 * @module components/ComicDetail/SlidingPanelContent
 */

import React from "react";
import { EditMetadataPanel } from "./EditMetadataPanel";
import type { RawFileDetails, InferredMetadata } from "../../../../graphql/generated";

// Import unified match panel system
import {
  MatchPanel,
  CollapsibleSearchForm,
  normalizeComicVineMatches,
  normalizeGCDMatches,
  normalizeMetronMatches,
  type SearchFormValues,
} from "../MatchPanel";

// Import raw types for adapters
import type { RawComicVineMatch } from "../MatchPanel/adapters/comicvineAdapter";
import type { ScoredGCDMatch } from "../../../../graphql/gcd.types";
import type { MetronMatch } from "../../../../types";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Header showing what comic is being searched for.
 */
const SearchingForHeader: React.FC<{
  inferredMetadata: InferredMetadata;
  sourceLabel?: string;
  sourceIcon?: string;
}> = ({ inferredMetadata, sourceLabel, sourceIcon }) => (
  <div className="border-slate-500 border rounded-lg p-2 mb-3">
    {sourceLabel && (
      <div className="flex items-center gap-2 mb-1">
        {sourceIcon && (
          <i className={`${sourceIcon} w-5 h-5 text-slate-500 dark:text-slate-400`} />
        )}
        <p className="text-slate-600 dark:text-slate-300 font-medium">{sourceLabel}</p>
      </div>
    )}
    <p className="text-slate-600 dark:text-slate-300">Searching for:</p>
    {inferredMetadata.issue ? (
      <>
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          {inferredMetadata.issue?.name}{" "}
        </span>
        <span className="text-slate-600 dark:text-slate-300">
          # {inferredMetadata.issue?.number}
        </span>
      </>
    ) : null}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ComicVine Panel
// ─────────────────────────────────────────────────────────────────────────────

interface CVMatchesPanelProps {
  rawFileDetails?: RawFileDetails;
  inferredMetadata: InferredMetadata;
  /** ComicVine matches from API - uses any[] for backward compatibility */
  comicVineMatches: any[];
  comicObjectId: string;
  queryClient: any;
  onMatchApplied: () => void;
  onManualSearch: (formValues: SearchFormValues) => void;
}

/**
 * Sliding panel content for ComicVine match search.
 *
 * Renders a search form, a preview of the inferred issue being searched for,
 * and a list of ComicVine match candidates the user can apply to the comic.
 *
 * @param props.onMatchApplied - Called after the user selects and applies a match,
 *   allowing the parent to close the panel and refresh state.
 */
export const CVMatchesPanel: React.FC<CVMatchesPanelProps> = ({
  inferredMetadata,
  comicVineMatches,
  comicObjectId,
  queryClient,
  onMatchApplied,
  onManualSearch,
}) => (
  <>
    <SearchingForHeader inferredMetadata={inferredMetadata} />

    <CollapsibleSearchForm source="comicvine" onSearch={onManualSearch} />

    <MatchPanel
      source="comicvine"
      matches={normalizeComicVineMatches(comicVineMatches)}
      comicObjectId={comicObjectId}
      queryClient={queryClient}
      onMatchApplied={onMatchApplied}
    />
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Metron Panel
// ─────────────────────────────────────────────────────────────────────────────

interface MetronMatchesPanelProps {
  rawFileDetails?: RawFileDetails;
  inferredMetadata: InferredMetadata;
  metronMatches: MetronMatch[];
  comicObjectId: string;
  queryClient: any;
  onMatchApplied: () => void;
  onManualSearch: (formValues: SearchFormValues) => void;
}

/**
 * Sliding panel content for Metron match search.
 *
 * Renders a search form, a preview of the inferred issue being searched for,
 * and a list of Metron match candidates the user can apply to the comic.
 *
 * @param props.onMatchApplied - Called after the user selects and applies a match,
 *   allowing the parent to close the panel and refresh state.
 */
export const MetronMatchesPanel: React.FC<MetronMatchesPanelProps> = ({
  inferredMetadata,
  metronMatches,
  comicObjectId,
  queryClient,
  onMatchApplied,
  onManualSearch,
}) => (
  <>
    <SearchingForHeader inferredMetadata={inferredMetadata} />

    <CollapsibleSearchForm source="metron" onSearch={onManualSearch} />

    <MatchPanel
      source="metron"
      matches={normalizeMetronMatches(metronMatches)}
      comicObjectId={comicObjectId}
      queryClient={queryClient}
      onMatchApplied={onMatchApplied}
    />
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// GCD Panel
// ─────────────────────────────────────────────────────────────────────────────

interface GCDMatchesPanelProps {
  rawFileDetails?: RawFileDetails;
  inferredMetadata: InferredMetadata;
  gcdMatches: ScoredGCDMatch[];
  comicObjectId: string;
  queryClient: any;
  onMatchApplied: () => void;
  onManualSearch: (formValues: SearchFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Sliding panel content for GCD (Grand Comics Database) match search.
 *
 * Renders a search form, a preview of the inferred issue being searched for,
 * and a list of GCD match candidates the user can apply to the comic.
 *
 * @param props.onMatchApplied - Called after the user selects and applies a match,
 *   allowing the parent to close the panel and refresh state.
 */
export const GCDMatchesPanel: React.FC<GCDMatchesPanelProps> = ({
  inferredMetadata,
  gcdMatches,
  comicObjectId,
  queryClient,
  onMatchApplied,
  onManualSearch,
  isLoading,
  error,
}) => (
  <>
    <SearchingForHeader
      inferredMetadata={inferredMetadata}
      sourceLabel="Grand Comics Database"
      sourceIcon="icon-[solar--database-bold-duotone]"
    />

    <CollapsibleSearchForm source="gcd" onSearch={onManualSearch} />

    <MatchPanel
      source="gcd"
      matches={normalizeGCDMatches(gcdMatches)}
      comicObjectId={comicObjectId}
      queryClient={queryClient}
      onMatchApplied={onMatchApplied}
      isLoading={isLoading}
      error={error}
    />
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Edit Metadata Panel
// ─────────────────────────────────────────────────────────────────────────────

type EditMetadataPanelWrapperProps = {
  rawFileDetails?: RawFileDetails;
};

/**
 * Wrapper for the EditMetadataPanel component.
 */
export const EditMetadataPanelWrapper: React.FC<EditMetadataPanelWrapperProps> = ({
  rawFileDetails,
}) => <EditMetadataPanel data={rawFileDetails ?? {}} />;
