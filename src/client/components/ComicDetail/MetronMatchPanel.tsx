import React, { ReactElement } from "react";
import MetronMatchResult from "./MetronMatchResult";
import { isEmpty } from "lodash";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import type { MetronMatchPanelProps } from "../../types";

/**
 * Displays Metron search results or a status message while searching.
 * Shows the scraping status from the store during the search process,
 * then renders MetronMatchResult when matches are available.
 */
export const MetronMatchPanel = ({ props: metronData }: MetronMatchPanelProps): ReactElement => {
  const { comicObjectId, metronMatches, queryClient, onMatchApplied } = metronData;

  // Get Metron scraping status from store
  const { metron } = useStore(
    useShallow((state) => ({
      metron: state.metron,
    }))
  );

  return (
    <div>
      {!isEmpty(metronMatches) ? (
        <MetronMatchResult
          matchData={metronMatches}
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
            <div>
              <p>Metron match results are an approximation.</p>
              <p>
                Auto-matching is not available yet. If you see no results or
                poor quality ones, you can override the search query
                parameters to get better ones.
              </p>
            </div>
          </article>
          <div className="text-md my-5">{metron.scrapingStatus}</div>
        </>
      )}
    </div>
  );
};

export default MetronMatchPanel;
