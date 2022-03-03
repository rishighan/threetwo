import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ZeroState from "./ZeroState";
import { RecentlyImported } from "./RecentlyImported";
import { WantedComicsList } from "./WantedComicsList";
import { VolumeGroups } from "./VolumeGroups";
import { PullList } from "./PullList";
import {
  fetchVolumeGroups,
  getComicBooks,
} from "../../actions/fileops.actions";
import { getLibraryStatistics } from "../../actions/comicinfo.actions";
import { isEmpty, isUndefined, map } from "lodash";
import prettyBytes from "pretty-bytes";

export const Dashboard = (): ReactElement => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchVolumeGroups());
    dispatch(
      getComicBooks({
        paginationOptions: {
          page: 0,
          limit: 5,
          sort: { updatedAt: "-1" },
        },
        predicate: { "acquisition.wanted": false },
        comicStatus: "recent",
      }),
    );
    dispatch(
      getComicBooks({
        paginationOptions: {
          page: 0,
          limit: 5,
          sort: { updatedAt: "-1" },
        },
        predicate: { "acquisition.wanted": true },
        comicStatus: "wanted",
      }),
    );
    dispatch(getLibraryStatistics());
  }, []);

  const recentComics = useSelector(
    (state: RootState) => state.fileOps.recentComics,
  );
  const wantedComics = useSelector(
    (state: RootState) => state.fileOps.wantedComics,
  );
  const volumeGroups = useSelector(
    (state: RootState) => state.fileOps.comicVolumeGroups,
  );

  const libraryStatistics = useSelector(
    (state: RootState) => state.comicInfo.libraryStatistics,
  );
  return (
    <div className="container">
      <section className="section">
        <h1 className="title">Dashboard</h1>

        {!isEmpty(recentComics) && !isEmpty(recentComics.docs) ? (
          <>
            {/* Pull List */}
            <PullList issues={recentComics} />

            {/* stats */}

            <h4 className="title is-4 mt-2">Statistics</h4>
            <div className="columns is-multiline">
              <div className="column is-narrow is-two-quarter">
                <dl className="box">
                  <dd className="is-size-4">
                    <span className="has-text-weight-bold">
                      {libraryStatistics.totalDocuments}
                    </span>{" "}
                    files
                  </dd>
                  <dd className="is-size-4">
                    Library size
                    <span className="has-text-weight-bold">
                      {" "}
                      {libraryStatistics.comicDirectorySize &&
                        prettyBytes(libraryStatistics.comicDirectorySize)}
                    </span>
                  </dd>
                  {!isUndefined(libraryStatistics.statistics) &&
                    !isEmpty(libraryStatistics.statistics[0].issues) && (
                      <dd className="is-size-6">
                        <span className="has-text-weight-bold">
                          {libraryStatistics.statistics[0].issues.length}
                        </span>{" "}
                        tagged with ComicVine
                      </dd>
                    )}
                  {!isUndefined(libraryStatistics.statistics) &&
                    !isEmpty(
                      libraryStatistics.statistics[0].issuesWithComicInfoXML,
                    ) && (
                      <dd className="is-size-6">
                        <span className="has-text-weight-bold">
                          {
                            libraryStatistics.statistics[0]
                              .issuesWithComicInfoXML.length
                          }
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
                    {!isUndefined(libraryStatistics.statistics) &&
                      !isEmpty(libraryStatistics.statistics[0].fileTypes) &&
                      map(
                        libraryStatistics.statistics[0].fileTypes,
                        (fileType, idx) => {
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
                        },
                      )}
                  </dd>
                </dl>
              </div>

              {/* file types */}
              <div className="p-3 column is-two-fifths">
                {/* publisher with most issues */}
                <dl className="box">
                  {!isUndefined(libraryStatistics.statistics) &&
                    !isEmpty(
                      libraryStatistics.statistics[0]
                        .publisherWithMostComicsInLibrary[0],
                    ) && (
                      <dd className="is-size-6">
                        <span className="has-text-weight-bold">
                          {
                            libraryStatistics.statistics[0]
                              .publisherWithMostComicsInLibrary[0]._id
                          }
                        </span>
                        {" has the most issues "}
                        <span className="has-text-weight-bold">
                          {
                            libraryStatistics.statistics[0]
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
            <WantedComicsList comics={wantedComics} />
            <RecentlyImported comicBookCovers={recentComics} />
            <VolumeGroups volumeGroups={volumeGroups} />
          </>
        ) : (
          <ZeroState
            header={"Set the source directory"}
            message={
              "No comics were found! Please point ThreeTwo! to a directory..."
            }
          />
        )}
      </section>
    </div>
  );
};

export default Dashboard;
