import React, { ReactElement } from "react";
import { RecentlyImported } from "./components/RecentlyImported";
import { WantedComicsList } from "./components/WantedComicsList";
import { VolumeGroups } from "./components/VolumeGroups";
import { LibraryStatistics } from "./components/LibraryStatistics";
import { PullList } from "./components/PullList";
import {
  useGetRecentComicsQuery,
  useGetWantedComicsQuery,
  useGetVolumeGroupsQuery,
  useGetLibraryStatisticsQuery
} from "../../../graphql/generated";

export const Dashboard = (): ReactElement => {
  // Use GraphQL for recent comics
  const { data: recentComicsData, error: recentComicsError } = useGetRecentComicsQuery(
    { limit: 5 },
    { refetchOnWindowFocus: false }
  );

  // Wanted Comics - using GraphQL
  const { data: wantedComicsData, error: wantedComicsError } = useGetWantedComicsQuery(
    {
      paginationOptions: {
        page: 1,
        limit: 5,
        sort: '{"updatedAt": -1}'
      },
      predicate: '{"acquisition.source.wanted": true}'
    },
    {
      refetchOnWindowFocus: false,
      retry: false
    }
  );

  // Volume Groups - using GraphQL
  const { data: volumeGroupsData, error: volumeGroupsError } = useGetVolumeGroupsQuery(
    undefined,
    { refetchOnWindowFocus: false }
  );

  // Library Statistics - using GraphQL
  const { data: statisticsData, error: statisticsError } = useGetLibraryStatisticsQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      retry: false
    }
  );

  const recentComics = recentComicsData?.comics?.comics || [];
  const wantedComics = !wantedComicsError ? (wantedComicsData?.getComicBooks?.docs || []) : [];
  const volumeGroups = volumeGroupsData?.getComicBookGroups || [];
  const statistics = !statisticsError ? statisticsData?.getLibraryStatistics : undefined;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <PullList />
        {recentComics.length > 0 && <RecentlyImported comics={recentComics} />}
        {/* Wanted comics */}
        <WantedComicsList comics={wantedComics} />
        {/* Library Statistics */}
        {statistics && <LibraryStatistics stats={statistics} />}
        {/* Volume groups */}
        <VolumeGroups volumeGroups={volumeGroups} />
      </div>
    </>
  );
};

export default Dashboard;
