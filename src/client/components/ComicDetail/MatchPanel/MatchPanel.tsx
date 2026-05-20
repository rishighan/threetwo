/**
 * @fileoverview MatchPanel Component
 *
 * Unified shell component for displaying match results from any metadata source.
 * Handles loading, error, and empty states, then renders MatchResultCards for each match.
 * Integrates with the Zustand store for socket-based scraping status updates.
 *
 * @module components/ComicDetail/MatchPanel/MatchPanel
 */

import React, { useEffect } from "react";
import { isEmpty } from "lodash";
import { useShallow } from "zustand/react/shallow";
import type { MatchPanelProps, MetadataSource } from "./types";
import { useMatchSource } from "./hooks";
import { MatchResultCard } from "./MatchResultCard";
import { useStore } from "../../../store";

// ─────────────────────────────────────────────────────────────────────────────
// State Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loading state with spinner and source-specific message.
 * Shows scraping status from socket events when available.
 */
const LoadingState: React.FC<{ source: MetadataSource; scrapingStatus?: string }> = ({
  source,
  scrapingStatus
}) => {
  const config = useMatchSource(source);
  
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {scrapingStatus || `Searching ${config.displayName}...`}
        </span>
      </div>
    </div>
  );
};

/**
 * Scraping status display for showing real-time progress from socket events.
 */
const ScrapingStatusBanner: React.FC<{ status: string }> = ({ status }) => (
  <div className="text-md my-5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
      <span>{status}</span>
    </div>
  </div>
);

/**
 * Error state with alert styling.
 */
const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <article
    role="alert"
    className="mt-4 rounded-lg max-w-screen-md border-s-4 border-red-500 bg-red-50 p-4 dark:border-s-4 dark:border-red-600 dark:bg-red-900 dark:text-slate-200 text-sm"
  >
    <div className="flex items-center gap-2">
      <i className="icon-[solar--danger-triangle-bold-duotone] w-5 h-5 text-red-500" />
      <span className="font-medium">Error</span>
    </div>
    <p className="mt-2">{error}</p>
  </article>
);

/**
 * Empty state shown when no matches are found.
 * Displays source-specific help message.
 */
const EmptyState: React.FC<{ source: MetadataSource }> = ({ source }) => {
  const config = useMatchSource(source);
  
  return (
    <article
      role="alert"
      className="mt-4 rounded-lg max-w-screen-md border-s-4 border-yellow-500 bg-yellow-50 p-4 dark:border-s-4 dark:border-yellow-600 dark:bg-yellow-300 dark:text-slate-600 text-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <i className={`${config.iconClass} w-5 h-5 text-yellow-600`} />
        <span className="font-medium">{config.displayName}</span>
      </div>
      <div>
        <p>{config.emptyMessage}</p>
        <p className="mt-2 text-slate-500">
          If you see no results or poor quality ones, you can override the search query
          parameters to get better matches.
        </p>
      </div>
    </article>
  );
};

/**
 * Section header with horizontal line.
 */
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <span className="flex items-center mt-6">
    <span className="text-md text-slate-500 dark:text-slate-500 pr-5">
      {title}
    </span>
    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400" />
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unified panel for displaying metadata matches from any source.
 * 
 * This component serves as the primary container for match results.
 * It handles all states (loading, error, empty, populated) and renders
 * a list of MatchResultCard components for each match.
 * 
 * @param props - Component props
 * @param props.source - Metadata source identifier
 * @param props.matches - Array of normalized match results
 * @param props.comicObjectId - ID of the comic to apply matches to
 * @param props.queryClient - React Query client for cache invalidation
 * @param props.onMatchApplied - Callback fired after successful apply
 * @param props.isLoading - Whether search is in progress
 * @param props.error - Error message if search failed
 * 
 * @example
 * ```tsx
 * import { MatchPanel } from "./MatchPanel";
 * import { normalizeGCDMatches } from "./adapters";
 * 
 * <MatchPanel
 *   source="gcd"
 *   matches={normalizeGCDMatches(gcdResults)}
 *   comicObjectId={comic._id}
 *   queryClient={queryClient}
 *   onMatchApplied={() => {
 *     closePanel();
 *     setActiveTab(0);
 *   }}
 *   isLoading={isSearching}
 *   error={searchError}
 * />
 * ```
 */
export const MatchPanel: React.FC<MatchPanelProps> = ({
  source,
  matches,
  comicObjectId,
  queryClient,
  onMatchApplied,
  isLoading = false,
  error = null,
}) => {
  const config = useMatchSource(source);
  
  // Subscribe to source-specific scraping status from Zustand store
  const { scrapingStatus, getSocket } = useStore(
    useShallow((state) => ({
      scrapingStatus:
        source === "comicvine" ? state.comicvine.scrapingStatus :
        source === "metron" ? state.metron.scrapingStatus :
        source === "gcd" ? state.gcd.scrapingStatus :
        "",
      getSocket: state.getSocket,
    }))
  );
  
  // Initialize socket connection when panel mounts to receive scraping status events
  useEffect(() => {
    // This ensures the socket is connected and listening for status events
    getSocket();
  }, [getSocket]);
  
  // Loading state - show scraping status from socket if available
  if (isLoading) {
    return <LoadingState source={source} scrapingStatus={scrapingStatus} />;
  }
  
  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }
  
  // Empty state - but first check if we're still receiving scraping updates
  if (isEmpty(matches)) {
    // If there's an active scraping status, show it instead of empty state
    if (scrapingStatus) {
      return (
        <div>
          <ScrapingStatusBanner status={scrapingStatus} />
        </div>
      );
    }
    return <EmptyState source={source} />;
  }
  
  // Populated state - render match cards (scraping status hidden once results arrive)
  return (
    <div>
      <SectionHeader title={`${config.displayName} Matches`} />
      
      {matches.map((match, idx) => (
        <MatchResultCard
          key={match.id}
          match={match}
          isBestMatch={idx === 0}
          comicObjectId={comicObjectId}
          queryClient={queryClient}
          onMatchApplied={onMatchApplied}
        />
      ))}
    </div>
  );
};

export default MatchPanel;
