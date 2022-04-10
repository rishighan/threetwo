import React, { ReactElement, useEffect } from "react";
import prettyBytes from "pretty-bytes";
import { isEmpty, isUndefined, map } from "lodash";

export const LibraryStatistics = (
  props: ILibraryStatisticsProps,
): ReactElement => {
  // const { stats } = props;
  return (
    <>
      <h4 className="title is-4 mt-2">Statistics</h4>
      <p className="subtitle is-7">A brief snapshot of your library.</p>
      <div className="columns is-multiline">
        <div className="column is-narrow is-two-quarter">
          <dl className="box">
            <dd className="is-size-4">
              <span className="has-text-weight-bold">
                {props.stats.totalDocuments}
              </span>{" "}
              files
            </dd>
            <dd className="is-size-4">
              Library size
              <span className="has-text-weight-bold">
                {" "}
                {props.stats.comicDirectorySize &&
                  prettyBytes(props.stats.comicDirectorySize)}
              </span>
            </dd>
            {!isUndefined(props.stats.statistics) &&
              !isEmpty(props.stats.statistics[0].issues) && (
                <dd className="is-size-6">
                  <span className="has-text-weight-bold">
                    {props.stats.statistics[0].issues.length}
                  </span>{" "}
                  tagged with ComicVine
                </dd>
              )}
            {!isUndefined(props.stats.statistics) &&
              !isEmpty(props.stats.statistics[0].issuesWithComicInfoXML) && (
                <dd className="is-size-6">
                  <span className="has-text-weight-bold">
                    {props.stats.statistics[0].issuesWithComicInfoXML.length}
                  </span>{" "}
                  with
                  <span className="tag is-warning has-text-weight-bold mr-2 ml-1">
                    ComicInfo.xml
                  </span>
                </dd>
              )}
          </dl>
        </div>

        <div className="p-3 column is-one-quarter">
          <dl className="box">
            <dd className="is-size-6">
              <span className="has-text-weight-bold"></span> Issues
            </dd>
            <dd className="is-size-6">
              <span className="has-text-weight-bold">304</span> Volumes
            </dd>
            <dd className="is-size-6">
              {!isUndefined(props.stats.statistics) &&
                !isEmpty(props.stats.statistics[0].fileTypes) &&
                map(props.stats.statistics[0].fileTypes, (fileType, idx) => {
                  return (
                    <span key={idx}>
                      <span className="has-text-weight-bold">
                        {fileType.data.length}
                      </span>
                      <span className="tag is-warning has-text-weight-bold mr-2 ml-1">
                        {fileType._id}
                      </span>
                    </span>
                  );
                })}
            </dd>
          </dl>
        </div>

        {/* file types */}
        <div className="p-3 column is-two-fifths">
          {/* publisher with most issues */}
          <dl className="box">
            {!isUndefined(props.stats.statistics) &&
              !isEmpty(
                props.stats.statistics[0].publisherWithMostComicsInLibrary[0],
              ) && (
                <dd className="is-size-6">
                  <span className="has-text-weight-bold">
                    {
                      props.stats.statistics[0]
                        .publisherWithMostComicsInLibrary[0]._id
                    }
                  </span>
                  {" has the most issues "}
                  <span className="has-text-weight-bold">
                    {
                      props.stats.statistics[0]
                        .publisherWithMostComicsInLibrary[0].count
                    }
                  </span>
                </dd>
              )}
            <dd className="is-size-6">
              <span className="has-text-weight-bold">304</span> Volumes
            </dd>
          </dl>
        </div>
      </div>
    </>
  );
};

export default LibraryStatistics;
