import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ZeroState from "./ZeroState";
import { RecentlyImported } from "./RecentlyImported";
import { WantedComicsList } from "./WantedComicsList";
import { VolumeGroups } from "./VolumeGroups";
import { LibraryStatistics } from "./LibraryStatistics";
import { PullList } from "./PullList";
import {
  fetchVolumeGroups,
  getComicBooks,
} from "../../actions/fileops.actions";
import { getLibraryStatistics } from "../../actions/comicinfo.actions";
import { isEmpty } from "lodash";

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
        predicate: { "acquisition.source.wanted": false },
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
        predicate: { "acquisition.source.wanted": true },
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

            {/* Stats */}
            {!isEmpty(libraryStatistics) && (
              <LibraryStatistics stats={libraryStatistics} />
            )}
            {/* Wanted comics */}
            {!isEmpty(wantedComics) && (
              <WantedComicsList comics={wantedComics} />
            )}
            {/* Recent imports */}
            {!isEmpty(recentComics) && (
              <RecentlyImported comicBookCovers={recentComics} />
            )}
            {/* Volumes */}
            {!isEmpty(volumeGroups) && (
              <VolumeGroups volumeGroups={volumeGroups} />
            )}
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
