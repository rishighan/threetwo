import React, { ReactElement } from "react";
import GCDMatchResult from "./GCDMatchResult";
import { isEmpty } from "lodash";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import type { ScoredGCDMatch } from "../../graphql/gcd.types";
import type { QueryClient } from "@tanstack/react-query";

interface GCDMatchPanelProps {
  props: {
    comicObjectId: string;
    gcdMatches: ScoredGCDMatch[];
    queryClient?: QueryClient;
    onMatchApplied?: () => void;
    isLoading?: boolean;
    error?: string | null;
  };
}

/**
 * Displays GCD (Grand Comics Database) search results or a status message while searching.
 * Shows the scraping status from the store during the search process,
 * then renders GCDMatchResult when matches are available.
 */
export const GCDMatchPanel = ({ props: gcdData }: GCDMatchPanelProps): ReactElement => {
  const { comicObjectId, gcdMatches, queryClient, onMatchApplied, isLoading, error } = gcdData;

  // Get GCD scraping status from store (if available)
  const { gcd } = useStore(
    useShallow((state) => ({
      gcd: state.gcd || { scrapingStatus: "" },
    }))
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Searching Grand Comics Database...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <article
        role="alert"
        className="mt-4 rounded-lg max-w-screen-md border-s-4 border-red-500 bg-red-50 p-4 dark:border-s-4 dark:border-red-600 dark:bg-red-900 dark:text-slate-200 text-sm"
      >
        <div className="flex items-center gap-2">
          <i className="icon-[solar--danger-triangle-bold-duotone] w-5 h-5 text-red-500"></i>
          <span className="font-medium">Error searching GCD</span>
        </div>
        <p className="mt-2">{error}</p>
      </article>
    );
  }

  return (
    <div>
      {!isEmpty(gcdMatches) ? (
        <GCDMatchResult
          matchData={gcdMatches}
          comicObjectId={comicObjectId}
          queryClient={queryClient}
          onMatchApplied={onMatchApplied}
        />
      ) : (
        <>
          <article
            role="alert"
            className="mt-4 rounded-lg max-w-screen-md border-s-4 border-yellow-500 bg-yellow-50 p-4 dark:border-s-4 dark:border-yellow-600 dark:bg-yellow-300 dark:text-slate-600 text-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <i className="icon-[solar--database-bold-duotone] w-5 h-5 text-yellow-600"></i>
              <span className="font-medium">Grand Comics Database</span>
            </div>
            <div>
              <p>GCD match results are an approximation based on series name, issue number, and year.</p>
              <p className="mt-1">
                The Grand Comics Database provides comprehensive metadata including detailed credits,
                story information, and publication details.
              </p>
              <p className="mt-2 text-slate-500">
                If you see no results or poor quality ones, you can override the search query
                parameters to get better matches.
              </p>
            </div>
          </article>
          {gcd?.scrapingStatus && (
            <div className="text-md my-5 text-slate-600 dark:text-slate-400">
              {gcd.scrapingStatus}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GCDMatchPanel;
