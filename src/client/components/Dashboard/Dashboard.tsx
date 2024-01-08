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
import { isEmpty, isNil, isUndefined } from "lodash";
import Header from "../shared/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "../shared/Carda";
import {
  LIBRARY_SERVICE_BASE_URI,
  LIBRARY_SERVICE_HOST,
} from "../../constants/endpoints";
import {
  determineCoverFile,
  determineExternalMetadata,
} from "../../shared/utils/metadata.utils";

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
          {recentComics?.data.docs.map(
            (
              {
                _id,
                rawFileDetails,
                sourcedMetadata: { comicvine, comicInfo, locg },
                inferredMetadata,
                acquisition: {
                  source: { name },
                },
              },
              idx,
            ) => {
              const { issueName, url } = determineCoverFile({
                rawFileDetails,
                comicvine,
                comicInfo,
                locg,
              });
              const { issue, coverURL, icon } = determineExternalMetadata(
                name,
                {
                  comicvine,
                  comicInfo,
                  locg,
                },
              );
              const isComicVineMetadataAvailable =
                !isUndefined(comicvine) &&
                !isUndefined(comicvine.volumeInformation);

              return (
                <Card
                  orientation="vertical-2"
                  key={idx}
                  imageUrl={`${LIBRARY_SERVICE_HOST}/${rawFileDetails.cover.filePath}`}
                  title={inferredMetadata.issue.name}
                  hasDetails
                >
                  <div>
                    <dd className="text-sm my-1 flex flex-row gap-1">
                      {/* Issue number */}
                      <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                        <span className="pr-1 pt-1">
                          <i className="icon-[solar--hashtag-outline]"></i>
                        </span>
                        <span className="text-md text-slate-900">
                          {inferredMetadata.issue.number}
                        </span>
                      </span>
                      {/* File extension */}
                      <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                        <span className="pr-1 pt-1">
                          <i className="icon-[solar--file-bold-duotone] w-4 h-4"></i>
                        </span>

                        <span className="text-md text-slate-500 dark:text-slate-900">
                          {rawFileDetails.extension}
                        </span>
                      </span>
                      {/* Uncompressed status  */}
                      {rawFileDetails?.archive?.uncompressed ? (
                        <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                          <span className="pr-1 pt-1">
                            <i className="icon-[solar--bookmark-bold-duotone] w-4 h-4"></i>
                          </span>
                        </span>
                      ) : null}
                    </dd>
                  </div>

                  <div className="flex flex-row items-center gap-1 my-1">
                    <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2">
                      {/* ComicInfo.xml presence */}
                      {!isNil(comicInfo) && !isEmpty(comicInfo) && (
                        <i className="h-7 w-7 my-1 icon-[solar--code-file-bold-duotone] text-yellow-500 dark:text-yellow-300"></i>
                      )}
                      {/* ComicVine metadata presence */}
                      {isComicVineMetadataAvailable && (
                        <span className="w-7 h-7">
                          <img
                            src="/src/client/assets/img/cvlogo.svg"
                            alt={"ComicVine metadata detected."}
                          />
                        </span>
                      )}
                    </div>
                    {/* Raw file presence  */}
                    {isNil(rawFileDetails) && (
                      <span className="h-6 w-5 sm:shrink-0 sm:items-center sm:gap-2">
                        <i className="icon-[solar--file-corrupted-outline] h-5 w-5" />
                      </span>
                    )}
                  </div>
                </Card>
              );
            },
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
