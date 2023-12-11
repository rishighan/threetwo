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
              orientation="horizontal-2-medium"
              key={idx}
              imageUrl={`${LIBRARY_SERVICE_HOST}/${recentComic.rawFileDetails.cover.filePath}`}
              title={recentComic.inferredMetadata.issue.name}
              hasDetails
            >
              <div>
                <dt className="sr-only">Address</dt>
                <dd className="text-sm my-1 flex flex-row gap-1">
                  <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                    <span className="pr-1 pt-1">
                      <i className="icon-[solar--hashtag-outline]"></i>
                    </span>
                    <span className="text-md text-slate-500">
                      {recentComic.inferredMetadata.issue.number}
                    </span>
                  </span>
                  <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                    <span className="pr-1 pt-1">
                      <i className="icon-[solar--file-bold-duotone] w-4 h-4"></i>
                    </span>

                    <span className="text-md text-slate-500">
                      {recentComic.rawFileDetails.extension}
                    </span>
                  </span>
                </dd>
              </div>

              <div className="flex flex-row items-center gap-4 my-2">
                <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2">
                  <i className="h-7 w-7 icon-[solar--code-file-bold-duotone] text-orange-400 dark:text-orange"></i>

                  {/* <div className="">
                <p className="text-gray-500">Parking</p>
                <p className="font-medium">2 spaces</p>
              </div> */}
                </div>

                <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2">
                  <svg
                    className="h-4 w-4 text-indigo-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>

                  {/* <div className="mt-1.5 sm:mt-0">
                <p className="text-slate-500">Bathroom</p>
                <p className="font-medium">2 rooms</p>
              </div> */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
