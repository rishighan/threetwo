import React, { useState, useEffect, useCallback } from "react";
import { IComicVineSearchMatch, IFolderData } from "threetwo-ui-typings";
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
                  <h4>{match.name}</h4>
                  <h5>{match.volume.name}</h5>
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
