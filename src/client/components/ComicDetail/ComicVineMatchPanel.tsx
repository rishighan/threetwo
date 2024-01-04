import React, { ReactElement } from "react";
import { ComicVineSearchForm } from "../ComicVineSearchForm";
import MatchResult from "./MatchResult";
import { isEmpty } from "lodash";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";

export const ComicVineMatchPanel = (comicVineData): ReactElement => {
  const { comicObjectId, comicVineMatches } = comicVineData.props;
  const { comicvine } = useStore(
    useShallow((state) => ({
      comicvine: state.comicvine,
    })),
  );
  return (
    <>
      <div>
        {!isEmpty(comicVineMatches) ? (
          <MatchResult
            matchData={comicVineMatches}
            comicObjectId={comicObjectId}
          />
        ) : (
          <>
            <article
              role="alert"
              className="mt-4 rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600 text-sm"
            >
              <div>
                <p>ComicVine match results are an approximation.</p>
                <p>
                  Auto-matching is not available yet. If you see no results or
                  poor quality ones, you can override the search query
                  parameters to get better ones.
                </p>
              </div>
            </article>
            <div className="text-md my-5">{comicvine.scrapingStatus}</div>
          </>
        )}
      </div>
    </>
  );
};

export default ComicVineMatchPanel;
