import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { map } from "lodash";
import { applyComicVineMatch } from "../actions/comicinfo.actions";

interface MatchResultProps {
  matchData: any;
}

const handleBrokenImage = (e) => {
  e.target.src = "http://localhost:3050/dist/img/noimage.svg";
};

export const MatchResult = (props: MatchResultProps) => {
  const dispatch = useDispatch();
  const applyCVMatch = useCallback(
    (match) => {
      dispatch(applyComicVineMatch(match));
    },
    [dispatch],
  );
  return (
    <>
      <table>
        <thead>
          <tr>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {map(props.matchData, (match, idx) => {
            return (
              <tr className="search-result" key={idx}>
                <td>
                  <img
                    className="cover-image"
                    src={match.image.thumb_url}
                    onError={handleBrokenImage}
                  />
                </td>
                <td className="search-result-details">
                  <div className="tag score is-primary is-medium is-pulled-right">
                    {parseFloat(match.score).toFixed(2)}
                  </div>
                  <div className="is-size-5">{match.name}</div>
                  <div className="is-size-6">{match.volume.name}</div>

                  <div className="field is-grouped is-grouped-multiline">
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
                        <span className="tag">Type</span>
                        <span className="tag is-warning">
                          {match.resource_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="button is-small is-outlined is-primary is-light is-pulled-right"
                    onClick={() => applyCVMatch(match)}
                  >
                    <span className="icon is-size-5">
                      <i className="fas fa-clipboard-check"></i>
                    </span>
                    <span>Apply Match</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default MatchResult;
