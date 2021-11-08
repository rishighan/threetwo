import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ZeroState from "./ZeroState";
import { RecentlyImported } from "./RecentlyImported";
import { VolumeGroups } from "./VolumeGroups";
import { getComicBooks } from "../actions/fileops.actions";
import { isEmpty, isNil, isUndefined } from "lodash";

export const Dashboard = (): ReactElement => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      getComicBooks({
        paginationOptions: {
          page: 0,
          limit: 5,
          sort: { updatedAt: "-1" },
        },
      }),
    );
  }, [dispatch]);
  const recentComics = useSelector(
    (state: RootState) => state.fileOps.recentComics,
  );
  const volumeGroups = useSelector(
    (state: RootState) => state.fileOps.comicVolumeGroups,
  );
  return (
    <div className="container">
      <section className="section">
        <h1 className="title">Dashboard</h1>

        {!isEmpty(recentComics) && !isEmpty(recentComics.docs) ? (
          <>
            <RecentlyImported comicBookCovers={recentComics} />
            {!isNil(volumeGroups) ? <VolumeGroups /> : null}
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
