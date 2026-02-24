import React, { ReactElement, useCallback, useEffect } from "react";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { format } from "date-fns";
import Loader from "react-loader-spinner";
import { isEmpty, isNil, isUndefined } from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import axios from "axios";

interface IProps {
  matches?: unknown;
  fetchComicMetadata?: any;
  path: string;
  covers?: any;
}

/**
 * Component to facilitate the import of comics to the ThreeTwo library
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
 */

export const Import = (props: IProps): ReactElement => {
  const queryClient = useQueryClient();
  const { importJobQueue, getSocket } = useStore(
    useShallow((state) => ({
      importJobQueue: state.importJobQueue,
      getSocket: state.getSocket,
    })),
  );

  const sessionId = localStorage.getItem("sessionId");
  const { mutate: initiateImport } = useMutation({
    mutationFn: async () =>
      await axios.request({
        url: `http://localhost:3000/api/library/newImport`,
        method: "POST",
        data: { sessionId },
      }),
  });

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["allImportJobResults"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "http://localhost:3000/api/jobqueue/getJobResultStatistics",
        params: { _t: Date.now() }, // Cache busting
      });
      console.log("Fetched import results:", response.data);
      return response;
    },
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data (formerly cacheTime)
  });

  // Ensure socket connection is established and listen for import completion
  useEffect(() => {
    const socket = getSocket("/");
    
    // Listen for import queue drained event to refresh the table
    const handleQueueDrained = () => {
      console.log("Import queue drained, refreshing table...");
      refetch();
    };

    // Listen for individual import completions to refresh the table
    const handleCoverExtracted = () => {
      console.log("Cover extracted, refreshing table...");
      refetch();
    };

    socket.on("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);
    socket.on("LS_COVER_EXTRACTED", handleCoverExtracted);

    return () => {
      socket.off("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);
      socket.off("LS_COVER_EXTRACTED", handleCoverExtracted);
    };
  }, [getSocket, refetch]);

  const toggleQueue = (queueAction: string, queueStatus: string) => {
    const socket = getSocket("/");
    socket.emit(
      "call",
      "socket.setQueueStatus",
      {
        queueAction,
        queueStatus,
      },
      (data: any) => console.log(data),
    );
  };
  /**
   * Method to render import job queue pause/resume controls on the UI
   *
   * @param status The `string` status (either `"pause"` or `"resume"`)
   * @returns ReactElement A `<button/>` that toggles queue status
   * @remarks Sets the global `importJobQueue.status` state upon toggling
   */
  const renderQueueControls = (status: string): ReactElement | null => {
    switch (status) {
      case "running":
        return (
          <div>
            <button
              className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
              onClick={() => {
                toggleQueue("pause", "paused");
                importJobQueue.setStatus("paused");
              }}
            >
              <span className="text-md">Pause</span>
              <span className="w-5 h-5">
                <i className="h-5 w-5 icon-[solar--pause-bold]"></i>
              </span>
            </button>
          </div>
        );
      case "paused":
        return (
          <div>
            <button
              className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
              onClick={() => {
                toggleQueue("resume", "running");
                importJobQueue.setStatus("running");
              }}
            >
              <span className="text-md">Resume</span>
              <span className="w-5 h-5">
                <i className="h-5 w-5 icon-[solar--play-bold]"></i>
              </span>
            </button>
          </div>
        );

      case "drained":
        return null;

      default:
        return null;
    }
  };
  return (
    <div>
      <section>
        <header className="bg-slate-200 dark:bg-slate-500">
          <div className="mx-auto max-w-screen-xl px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Import
                </h1>

                <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                  Import comics into the ThreeTwo library.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          <article
            role="alert"
            className="rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
          >
            <div>
              <p>
                Importing will add comics identified from the mapped folder into
                ThreeTwo's database.
              </p>
              <p>
                Metadata from ComicInfo.xml, if present, will also be extracted.
              </p>
              <p>
                This process could take a while, if you have a lot of comics, or
                are importing over a network connection.
              </p>
            </div>
          </article>

          <div className="my-4">
            {(importJobQueue.status === "drained" ||
              importJobQueue.status === undefined) && (
              <button
                className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-5 py-3 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                onClick={() => {
                  initiateImport();
                  importJobQueue.setStatus("running");
                }}
              >
                <span className="text-md">Start Import</span>
                <span className="w-6 h-6">
                  <i className="h-6 w-6 icon-[solar--file-left-bold-duotone]"></i>
                </span>
              </button>
            )}
          </div>

          {/* Activity */}
          {(importJobQueue.status === "running" ||
            importJobQueue.status === "paused") && (
            <>
              <span className="flex items-center my-5 max-w-screen-lg">
                <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
                  Import Activity
                </span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
              </span>
              <div className="mt-5 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                  {/* Successful import counts */}
                  <div className="flex flex-col rounded-lg bg-green-100 dark:bg-green-200 px-4 py-6 text-center">
                    <dd className="text-3xl text-green-600 md:text-5xl">
                      {importJobQueue.successfulJobCount}
                    </dd>
                    <dt className="text-lg font-medium text-gray-500">
                      imported
                    </dt>
                  </div>
                  {/* Failed job counts */}
                  <div className="flex flex-col rounded-lg bg-red-100 dark:bg-red-200 px-4 py-6 text-center">
                    <dd className="text-3xl text-red-600 md:text-5xl">
                      {importJobQueue.failedJobCount}
                    </dd>
                    <dt className="text-lg font-medium text-gray-500">
                      failed
                    </dt>
                  </div>

                  <div className="flex flex-col dark:text-slate-200 text-slate-400">
                    <dd>{renderQueueControls(importJobQueue.status)}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex">
                <span className="mt-2 dark:text-slate-200 text-slate-400">
                  Imported: <span>{importJobQueue.mostRecentImport}</span>
                </span>
              </div>
            </>
          )}

          {/* Past imports */}
          {!isLoading && !isEmpty(data?.data) && (
            <div className="max-w-screen-lg">
              <span className="flex items-center mt-6">
                <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
                  Past Imports
                </span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
              </span>

              <div className="overflow-x-auto w-fit mt-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-200 text-md">
                  <thead className="ltr:text-left rtl:text-right">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        #
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        Time Started
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        Session Id
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        Imported
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        Failed
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {data?.data.map((jobResult: any, index: number) => {
                      return (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300 font-medium">
                            {index + 1}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                            {format(
                              new Date(jobResult.earliestTimestamp),
                              "EEEE, hh:mma, do LLLL Y",
                            )}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                            <span className="tag is-warning">
                              {jobResult.sessionId}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300">
                            <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                              <span className="h-5 w-6">
                                <i className="icon-[solar--check-circle-line-duotone] h-5 w-5"></i>
                              </span>
                              <p className="whitespace-nowrap text-sm">
                                {jobResult.completedJobs}
                              </p>
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300">
                            <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                              <span className="h-5 w-6">
                                <i className="icon-[solar--close-circle-line-duotone] h-5 w-5"></i>
                              </span>

                              <p className="whitespace-nowrap text-sm">
                                {jobResult.failedJobs}
                              </p>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Import;
