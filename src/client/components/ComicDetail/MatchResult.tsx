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
            <div className="flex flex-row gap-4">
              <div className="min-w-fit">
                <img
                  className="rounded-md"
                  src={match.image.thumb_url}
                  onError={handleBrokenImage}
                />
              </div>
              <div className="">
                {match.name ? <p className="text-md">{match.name}</p> : null}
                <span className="flex flex-row gap-2 mb-2">
                  <span className="inline-flex items-center bg-slate-50 text-sm text-slate-800 font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                    <span className="pr-1 pt-1">
                      <i className="icon-[solar--hashtag-outline] w-4 h-4"></i>
                    </span>
                    <span className="text-slate-900 dark:text-slate-900">
                      {parseInt(match.issue_number, 10)}
                    </span>
                  </span>
                  <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                    <span className="pr-1 pt-1">
                      <i className="icon-[solar--calendar-mark-bold-duotone] w-5 h-5"></i>
                    </span>
                    <span className="text-slate-900 dark:text-slate-900">
                      Cover Date: {match.cover_date}
                    </span>
                  </span>
                </span>
                <div className="text-sm">
                  {ellipsize(issueDescription, 300)}
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-2 my-4 ml-10">
              <div className="">
                <img
                  src={match.volumeInformation.results.image.icon_url}
                  className="rounded-md w-full"
                  onError={handleBrokenImage}
                />
              </div>

              <div className="">
                <span>{match.volume.name}</span>
                <div className="text-sm">
                  <p>
                    Total Issues:
                    {match.volumeInformation.results.count_of_issues}
                  </p>
                  <p>
                    Publisher:
                    {match.volumeInformation.results.publisher.name}
                  </p>
                </div>
              </div>
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
