import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, map } from "lodash";
import { applyComicVineMatch } from "../actions/comicinfo.actions";
import { convert } from "html-to-text";
import ellipsize from "ellipsize";

interface MatchResultProps {
  matchData: any;
  comicObjectId: string;
}

const handleBrokenImage = (e) => {
  e.target.src = "http://localhost:3050/dist/img/noimage.svg";
};

export const MatchResult = (props: MatchResultProps) => {
  const dispatch = useDispatch();
  const applyCVMatch = useCallback(
    (match, comicObjectId) => {
      dispatch(applyComicVineMatch(match, comicObjectId));
    },
    [dispatch],
  );
  return (
    <>
      {map(props.matchData, (match, idx) => {
        let issueDescription = "";
        if (!isNil(match.description)) {
          issueDescription = convert(match.description, {
            baseElements: {
              selectors: ["p"],
            },
          });
        }
        return (
          <div className="search-result mb-4">
            <div className="columns">
              <div className="column is-one-fifth">
                <img
                  className="cover-image"
                  src={match.image.thumb_url}
                  onError={handleBrokenImage}
                />
              </div>

              <div className="search-result-details column">
                <div className="is-size-5">{match.name}</div>

                <div className="field is-grouped is-grouped-multiline mt-1">
                  <div className="control">
                    <div className="tags has-addons">
                      <span className="tag">Number</span>
                      <span className="tag is-primary">
                        {match.issue_number}
                      </span>
                    </div>
                  </div>
                  <div className="control">
                    <div className="tags has-addons">
                      <span className="tag">Cover Date</span>
                      <span className="tag is-warning">{match.cover_date}</span>
                    </div>
                  </div>
                </div>
                <div className="is-size-7">
                  {ellipsize(issueDescription, 300)}
                </div>
              </div>
            </div>

            <div className="vertical-line"></div>

            <div className="columns ml-6 volume-information">
              <div className="column is-one-fifth">
                <img
                  src={match.volumeInformation.results.image.icon_url}
                  className="cover-image"
                  onError={handleBrokenImage}
                />
              </div>

              <div className="column">
                <div className="is-size-6">{match.volume.name}</div>
                <div className="field is-grouped is-grouped-multiline mt-2">
                  <div className="control">
                    <div className="tags has-addons">
                      <span className="tag">Total Issues</span>
                      <span className="tag is-warning">
                        {match.volumeInformation.results.count_of_issues}
                      </span>
                    </div>
                  </div>

                  <div className="control">
                    <div className="tags has-addons">
                      <span className="tag">Publisher</span>
                      <span className="tag is-warning">
                        {match.volumeInformation.results.publisher.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="columns">
              <div className="column">
                <button
                  className="button is-normal is-outlined is-primary is-light is-pulled-right"
                  onClick={() => applyCVMatch(match, props.comicObjectId)}
                >
                  <span className="icon is-size-5">
                    <i className="fas fa-clipboard-check"></i>
                  </span>
                  <span>Apply Match</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default MatchResult;
