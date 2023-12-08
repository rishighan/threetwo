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
import { isEmpty, isNil } from "lodash";
import Header from "../shared/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "../shared/Carda";
import {
  LIBRARY_SERVICE_BASE_URI,
  LIBRARY_SERVICE_HOST,
} from "../../constants/endpoints";

export const Dashboard = (): ReactElement => {
  const { data: recentComics } = useQuery({
    queryFn: async () =>
      await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBooks`,
        method: "POST",
        data: {
          paginationOptions: {
            page: 0,
            limit: 5,
            sort: { updatedAt: "-1" },
          },
          predicate: { "acquisition.source.wanted": false },
          comicStatus: "recent",
        },
      }),
    queryKey: ["recentComics"],
  });

  console.log("hari om", recentComics);
  //   useEffect(() => {
  //     dispatch(fetchVolumeGroups());
  //     dispatch(
  //       getComicBooks({
  //         paginationOptions: {
  //           page: 0,
  //           limit: 5,
  //           sort: { updatedAt: "-1" },
  //         },
  //         predicate: { "acquisition.source.wanted": false },
  //         comicStatus: "recent",
  //       }),
  //     );
  //     dispatch(
  //       getComicBooks({
  //         paginationOptions: {
  //           page: 0,
  //           limit: 5,
  //           sort: { updatedAt: "-1" },
  //         },
  //         predicate: { "acquisition.source.wanted": true },
  //         comicStatus: "wanted",
  //       }),
  //     );
  //     dispatch(getLibraryStatistics());
  //   }, []);
  //
  //   const recentComics = useSelector(
  //     (state: RootState) => state.fileOps.recentComics,
  //   );
  //   const wantedComics = useSelector(
  //     (state: RootState) => state.fileOps.wantedComics,
  //   );
  //   const volumeGroups = useSelector(
  //     (state: RootState) => state.fileOps.comicVolumeGroups,
  //   );
  //
  //   const libraryStatistics = useSelector(
  //     (state: RootState) => state.comicInfo.libraryStatistics,
  //   );
  return (
    <div className="container mx-auto max-w-full">
      <section>
        <h1>Dashboard</h1>
        <div className="grid grid-cols-5 gap-6">
          {recentComics?.data.docs.map((recentComic, idx) => (
            <Card
              orientation="vertical-2"
              key={idx}
              imageUrl={`${LIBRARY_SERVICE_HOST}/${recentComic.rawFileDetails.cover.filePath}`}
              title={recentComic.inferredMetadata.issue.name}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
