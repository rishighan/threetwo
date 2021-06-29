import React, { useEffect } from "react";
import { map } from "lodash";

interface MatchResultProps {
  matchData: any;
}

export const MatchResult = (props: MatchResultProps) => {
  useEffect(() => {
    console.log("match", props.matchData);
  }, [props.matchData]);

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
              <tr className="search-result">
                <td key={idx}>
                  <img className="cover-image" src={match.image.thumb_url} />
                </td>
                <td className="search-result-details">
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
