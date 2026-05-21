import React, { useState } from "react";
import { ComicVineSearchForm, SearchFormValues } from "../metadata-matching/comicvine/ComicVineSearchForm";
import { ComicVineMatchPanel } from "../metadata-matching/comicvine/ComicVineMatchPanel";
import { MetronSearchForm } from "../metadata-matching/metron/MetronSearchForm";
import { MetronMatchPanel } from "../metadata-matching/metron/MetronMatchPanel";
import { GCDSearchForm, GCDSearchFormValues } from "../metadata-matching/gcd/GCDSearchForm";
import { GCDMatchPanel } from "../metadata-matching/gcd/GCDMatchPanel";
import { EditMetadataPanel } from "./EditMetadataPanel";
import type { RawFileDetails, InferredMetadata } from "../../../../graphql/generated";
import type { MetronSearchFormValues, MetronMatch } from "../../../../types";
import type { ScoredGCDMatch } from "../../../../graphql/gcd.types";
>>>>>>> 52eba9e (Reorganization of components):src/client/components/pages/ComicDetail/components/SlidingPanelContent.tsx
=======
import React, { useState } from "react";
import { ComicVineSearchForm, SearchFormValues } from "../metadata-matching/comicvine/ComicVineSearchForm";
import { ComicVineMatchPanel } from "../metadata-matching/comicvine/ComicVineMatchPanel";
import { MetronSearchForm } from "../metadata-matching/metron/MetronSearchForm";
import { MetronMatchPanel } from "../metadata-matching/metron/MetronMatchPanel";
import { GCDSearchForm, GCDSearchFormValues } from "../metadata-matching/gcd/GCDSearchForm";
import { GCDMatchPanel } from "../metadata-matching/gcd/GCDMatchPanel";
import { EditMetadataPanel } from "./EditMetadataPanel";
import type { RawFileDetails, InferredMetadata } from "../../../../graphql/generated";
import type { MetronSearchFormValues, MetronMatch } from "../../../../types";
import type { ScoredGCDMatch } from "../../../../graphql/gcd.types";
>>>>>>> 52eba9e (Reorganization of components):src/client/components/pages/ComicDetail/components/SlidingPanelContent.tsx

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
