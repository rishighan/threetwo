import React, { ReactElement } from "react";
import ZeroState from "./ZeroState";
import { RecentlyImported } from "./RecentlyImported";
import { WantedComicsList } from "./WantedComicsList";
import { VolumeGroups } from "./VolumeGroups";
import { LibraryStatistics } from "./LibraryStatistics";
import { PullList } from "./PullList";
import { getLibraryStatistics } from "../../actions/comicinfo.actions";
import { isEmpty, isNil, isUndefined } from "lodash";
import Header from "../shared/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
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

  const { data: wantedComics } = useQuery({
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
          predicate: { "acquisition.source.wanted": true },
        },
      }),
    queryKey: ["wantedComics"],
  });
  const { data: volumeGroups } = useQuery({
    queryFn: async () =>
      await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookGroups`,
        method: "GET",
      }),
    queryKey: ["volumeGroups"],
  });

  //
  //   const libraryStatistics = useSelector(
  //     (state: RootState) => state.comicInfo.libraryStatistics,
  //   );
  return (
    <div className="container mx-auto max-w-full">
      <h1>Dashboard</h1>
      <PullList />

      {recentComics && <RecentlyImported comics={recentComics?.data.docs} />}
      {/* Wanted comics */}
      <WantedComicsList comics={wantedComics?.data?.docs} />
      {/* Volume groups */}
      <VolumeGroups volumeGroups={volumeGroups?.data} />
    </div>
  );
};

export default Dashboard;
