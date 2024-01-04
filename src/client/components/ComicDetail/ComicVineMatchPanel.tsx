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
          <div className="text-md my-5">{comicvine.scrapingStatus}</div>
        )}
      </div>
    </>
  );
};

export default ComicVineMatchPanel;
