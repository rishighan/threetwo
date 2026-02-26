import React, { ReactElement } from "react";
import ZeroState from "./ZeroState";
import { RecentlyImported } from "./RecentlyImported";
import { WantedComicsList } from "./WantedComicsList";
import { VolumeGroups } from "./VolumeGroups";
import { LibraryStatistics } from "./LibraryStatistics";
import { PullList } from "./PullList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LIBRARY_SERVICE_BASE_URI } from "../../constants/endpoints";

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
          predicate: {
            wanted: { $exists: false },
          },
          comicStatus: "recent",
        },
      }),
    queryKey: ["recentComics"],
  });
  // Wanted Comics
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
          predicate: {
            wanted: { $exists: true, $ne: null },
          },
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

  const { data: statistics } = useQuery({
    queryFn: async () =>
      await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/libraryStatistics`,
        method: "GET",
      }),
    queryKey: ["libraryStatistics"],
  });

  return (
    <>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <PullList />
        {recentComics && <RecentlyImported comics={recentComics?.data.docs} />}
        {/* Wanted comics */}
        <WantedComicsList comics={wantedComics?.data?.docs} />
        {/* Library Statistics */}
        {statistics && <LibraryStatistics stats={statistics?.data} />}
        {/* Volume groups */}
        <VolumeGroups volumeGroups={volumeGroups?.data} />
      </div>
    </>
  );
};

export default Dashboard;
