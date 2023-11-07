import React, { ReactElement } from "react";
import { ComicVineSearchForm } from "../ComicVineSearchForm";
import MatchResult from "./MatchResult";
import { isEmpty } from "lodash";

export const ComicVineMatchPanel = (comicVineData): ReactElement => {
  const {
    comicObjectId,
    comicVineSearchQueryObject,
    comicVineAPICallProgress,
    comicVineSearchResults,
  } = comicVineData.props;
  return (
    <>
      <div className="search-results-container">
        {!isEmpty(comicVineSearchResults) && (
          <MatchResult
            matchData={comicVineSearchResults}
            comicObjectId={comicObjectId}
          />
        )}
      </div>
    </>
  );
};

export default ComicVineMatchPanel;
