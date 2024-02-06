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
      <span className="flex items-center mt-6">
        <span className="text-md text-slate-500 dark:text-slate-500 pr-5">
          ComicVine Matches
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
      </span>
      {map(props.matchData, (match, idx) => {
        let issueDescription = "";
        if (!isNil(match.description)) {
          issueDescription = convert(match.description, {
            baseElements: {
              selectors: ["p"],
            },
          });
        }
        const bestMatchCSSClass = idx === 0 ? "bg-green-100" : "bg-slate-300";
        return (
          <div className={`${bestMatchCSSClass} my-5 p-4 rounded-lg`} key={idx}>
            <div className="flex flex-row gap-4">
              <div className="min-w-fit">
                <img
                  className="rounded-md"
                  src={match.image.thumb_url}
                  onError={handleBrokenImage}
                />
              </div>
              <div>
                <div className="flex flex-row mb-1 justify-end">
                  {match.name ? (
                    <p className="text-md w-full">{match.name}</p>
                  ) : null}

                  {/* score */}
                  <span className="inline-flex h-fit w-fit items-center bg-green-50 text-sm text-slate-800 font-medium px-2 rounded-md dark:text-slate-900 dark:bg-green-400">
                    <span className="pr-1 pt-1">
                      <i className="icon-[solar--course-up-line-duotone] w-4 h-4"></i>
                    </span>
                    <span className="text-slate-900 dark:text-slate-900">
                      {parseInt(match.score, 10)}
                    </span>
                  </span>
                </div>
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
                    Published by{" "}
                    {match.volumeInformation.results.publisher.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                onClick={() => applyCVMatch(match, props.comicObjectId)}
              >
                <span className="text-md">Apply Match</span>
                <span className="w-5 h-5">
                  <i className="h-5 w-5 icon-[solar--magic-stick-3-bold-duotone]"></i>
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default MatchResult;
