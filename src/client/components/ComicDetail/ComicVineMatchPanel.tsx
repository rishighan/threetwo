import React, { ReactElement } from "react";
import { ComicVineSearchForm } from "../ComicVineSearchForm";
import MatchResult from "../MatchResult";
import { isEmpty } from "lodash";

export const ComicVineMatchPanel = (comicVineData): ReactElement => {
  const {
    comicObjectId,
    comicVineSearchQueryObject,
    comicVineAPICallProgress,
    comicVineSearchResults,
  } = comicVineData.props;
  console.log(comicVineData);
  return (
    <>
      {!isEmpty(comicVineSearchQueryObject) && (
        <div className="card search-criteria-card">
          <div className="card-content">
            <ComicVineSearchForm />
            <p className="is-size-6">Searching against:</p>
            <div className="field is-grouped is-grouped-multiline">
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag">Title</span>
                  <span className="tag is-info">
                    {comicVineSearchQueryObject.issue.inferredIssueDetails.name}
                  </span>
                </div>
              </div>
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag">Number</span>
                  <span className="tag is-info">
                    {
                      comicVineSearchQueryObject.issue.inferredIssueDetails
                        .number
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
