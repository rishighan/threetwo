import React from "react";
import { isNil, map } from "lodash";
import { convert } from "html-to-text";
import ellipsize from "ellipsize";
import { LIBRARY_SERVICE_BASE_URI } from "../../constants/endpoints";
import axios from "axios";

interface MatchResultProps {
  matchData: any;
  comicObjectId: string;
}

const handleBrokenImage = (e) => {
  e.target.src = "http://localhost:3050/dist/img/noimage.svg";
};

export const MatchResult = (props: MatchResultProps) => {
  const applyCVMatch = async (match, comicObjectId) => {
    return await axios.request({
      url: `${LIBRARY_SERVICE_BASE_URI}/applyComicVineMetadata`,
      method: "POST",
      data: {
        match,
        comicObjectId,
      },
    });
  };
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
          <div className="mb-4" key={idx}>
            <div className="flex flex-row">
              <div className="w-full mr-2">
                <img
                  className="rounded-md"
                  src={match.image.thumb_url}
                  onError={handleBrokenImage}
                />
              </div>
              <div>
                <div className="">{match.name}</div>
                <span>Number</span>
                <span>{match.issue_number}</span>
                <span className="tag">Cover Date</span>
                <span className="tag is-warning">{match.cover_date}</span>
                <div className="text-sm">
                  {ellipsize(issueDescription, 300)}
                </div>
              </div>
            </div>

            <div className="">
              <div className="">
                <img
                  src={match.volumeInformation.results.image.icon_url}
                  className="cover-image"
                  onError={handleBrokenImage}
                />
              </div>

              <div className="">
                <div className="">{match.volume.name}</div>
                <div className="">
                  <span className="">Total Issues</span>
                  <span className="">
                    {match.volumeInformation.results.count_of_issues}
                  </span>
                </div>
              </div>

              <span className="tag">Publisher</span>
              <span className="tag is-warning">
                {match.volumeInformation.results.publisher.name}
              </span>
            </div>
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
        );
      })}
    </>
  );
};

export default MatchResult;
