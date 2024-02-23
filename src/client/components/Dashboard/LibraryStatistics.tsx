import React, { ReactElement, useEffect } from "react";
import prettyBytes from "pretty-bytes";
import { isEmpty, isUndefined, map } from "lodash";
import Header from "../shared/Header";

export const LibraryStatistics = (
  props: ILibraryStatisticsProps,
): ReactElement => {
  const { stats } = props;
  return (
    <div className="mt-5">
      <Header
        headerContent="Your Library In Numbers"
        subHeaderContent={
          <span className="text-md">A brief snapshot of your library.</span>
        }
        iconClassNames="fa-solid fa-binoculars mr-2"
      />

      <div className="mt-3">
        <div className="flex flex-row gap-5">
          <div className="flex flex-col rounded-lg bg-green-100 dark:bg-green-200 px-4 py-6 text-center">
            <dt className="text-lg font-medium text-gray-500">Library size</dt>
            <dd className="text-3xl text-green-600 md:text-5xl">
              {props.stats.totalDocuments} files
            </dd>
            <dd>
              <span className="text-2xl text-green-600">
                {props.stats.comicDirectorySize &&
                  prettyBytes(props.stats.comicDirectorySize)}
              </span>
            </dd>
          </div>
          {/* comicinfo and comicvine tagged issues */}
          <div className="flex flex-col gap-4">
            {!isUndefined(props.stats.statistics) &&
              !isEmpty(props.stats.statistics[0].issues) && (
                <div className="flex flex-col h-fit rounded-lg bg-green-100 dark:bg-green-200 px-4 py-3 text-center">
                  <span className="text-xl">
                    {props.stats.statistics[0].issues.length}
                  </span>{" "}
                  tagged with ComicVine
                </div>
              )}
            {!isUndefined(props.stats.statistics) &&
              !isEmpty(props.stats.statistics[0].issuesWithComicInfoXML) && (
                <div className="flex flex-col h-fit rounded-lg bg-green-100 dark:bg-green-200 px-4 py-3 text-center">
                  <span className="text-xl">
                    {props.stats.statistics[0].issuesWithComicInfoXML.length}
                  </span>{" "}
                  <span className="tag is-warning has-text-weight-bold mr-2 ml-1">
                    with ComicInfo.xml
                  </span>
                </div>
              )}
          </div>

          <div className="">
            {!isUndefined(props.stats.statistics) &&
              !isEmpty(props.stats.statistics[0].fileTypes) &&
              map(props.stats.statistics[0].fileTypes, (fileType, idx) => {
                return (
                  <span
                    key={idx}
                    className="flex flex-col mb-4 h-fit text-xl rounded-lg bg-green-100 dark:bg-green-200 px-4 py-3 text-center"
                  >
                    {fileType.data.length} {fileType._id}
                  </span>
                );
              })}
          </div>

          {/* file types */}
          <div className="flex flex-col h-fit text-lg rounded-lg bg-green-100 dark:bg-green-200 px-4 py-3">
            {/* publisher with most issues */}
            {!isUndefined(props.stats.statistics) &&
              !isEmpty(
                props.stats.statistics[0].publisherWithMostComicsInLibrary[0],
              ) && (
                <>
                  <span className="">
                    {
                      props.stats.statistics[0]
                        .publisherWithMostComicsInLibrary[0]._id
                    }
                  </span>
                  {" has the most issues "}
                  <span className="">
                    {
                      props.stats.statistics[0]
                        .publisherWithMostComicsInLibrary[0].count
                    }
                  </span>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryStatistics;
