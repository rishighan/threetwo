import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { isEmpty, isNil, isUndefined } from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import axios from "axios";
import {
  useGetJobResultStatisticsQuery,
  useGetCachedImportStatisticsQuery,
  useStartIncrementalImportMutation
} from "../../graphql/generated";
import { RealTimeImportStats } from "./RealTimeImportStats";

interface ImportProps {
  path: string;
}

/**
 * Import component for adding comics to the ThreeTwo library.
 * Provides preview statistics, smart import, and queue management.
 */
export const Import = (props: ImportProps): ReactElement => {
  const queryClient = useQueryClient();
  const [socketReconnectTrigger, setSocketReconnectTrigger] = useState(0);
  const { importJobQueue, getSocket, disconnectSocket } = useStore(
    useShallow((state) => ({
      importJobQueue: state.importJobQueue,
      getSocket: state.getSocket,
      disconnectSocket: state.disconnectSocket,
    })),
  );

  const { mutate: startIncrementalImport, isPending: isStartingImport } = useStartIncrementalImportMutation({
    onSuccess: (data) => {
      if (data.startIncrementalImport.success) {
        importJobQueue.setStatus("running");
      }
    },
  });

  const { mutate: initiateImport } = useMutation({
    mutationFn: async () => {
      const sessionId = localStorage.getItem("sessionId");
      return await axios.request({
        url: `http://localhost:3000/api/library/newImport`,
        method: "POST",
        data: { sessionId },
      });
    },
  });

  const { data, isError, isLoading, refetch } = useGetJobResultStatisticsQuery();
  
  // Get cached import statistics to determine if Start Import button should be shown
  const { data: cachedStats } = useGetCachedImportStatisticsQuery(
    {},
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  );

  // Determine if we should show the Start Import button
  const hasNewFiles = cachedStats?.getCachedImportStatistics?.success &&
    cachedStats.getCachedImportStatistics.stats &&
    cachedStats.getCachedImportStatistics.stats.newFiles > 0 &&
    cachedStats.getCachedImportStatistics.stats.pendingFiles === 0;

  useEffect(() => {
    const socket = getSocket("/");
    const handleQueueDrained = () => refetch();
    const handleCoverExtracted = () => refetch();

    socket.on("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);
    socket.on("LS_COVER_EXTRACTED", handleCoverExtracted);

    return () => {
      socket.off("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);
      socket.off("LS_COVER_EXTRACTED", handleCoverExtracted);
    };
  }, [getSocket, refetch, socketReconnectTrigger]);

  /**
   * Toggles import queue pause/resume state
   */
  const toggleQueue = (queueAction: string, queueStatus: string) => {
    const socket = getSocket("/");
    socket.emit(
      "call",
      "socket.setQueueStatus",
      {
        queueAction,
        queueStatus,
      },
    );
  };

  /**
   * Starts smart import, resetting session if queue was drained
   */
  const handleStartSmartImport = () => {
    if (importJobQueue.status === "drained") {
      localStorage.removeItem("sessionId");
      disconnectSocket("/");
      setTimeout(() => {
        getSocket("/");
        setSocketReconnectTrigger(prev => prev + 1);
        setTimeout(() => {
          const sessionId = localStorage.getItem("sessionId") || "";
          startIncrementalImport({ sessionId });
        }, 500);
      }, 100);
    } else {
      const sessionId = localStorage.getItem("sessionId") || "";
      startIncrementalImport({ sessionId });
    }
  };

  /**
   * Renders pause/resume controls based on queue status
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
          <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
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
          {/* Real-Time Import Statistics Widget */}
          <div className="mb-6 max-w-screen-lg">
            <RealTimeImportStats />
          </div>

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

          {/* Start Smart Import Button - shown when there are new files and no import is running */}
          {hasNewFiles &&
           (importJobQueue.status === "drained" || importJobQueue.status === undefined) && (
            <div className="my-6 max-w-screen-lg">
              <button
                className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-5 py-3 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartSmartImport}
                disabled={isStartingImport}
              >
                <span className="text-md font-medium">
                  {isStartingImport ? "Starting Import..." : `Start Smart Import (${cachedStats?.getCachedImportStatistics?.stats?.newFiles} new files)`}
                </span>
                <span className="w-6 h-6">
                  <i className="h-6 w-6 icon-[solar--file-left-bold-duotone]"></i>
                </span>
              </button>
            </div>
          )}

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
                  <div className="flex flex-col rounded-lg bg-green-100 dark:bg-green-200 px-4 py-6 text-center">
                    <dd className="text-3xl text-green-600 md:text-5xl">
                      {importJobQueue.successfulJobCount}
                    </dd>
                    <dt className="text-lg font-medium text-gray-500">
                      imported
                    </dt>
                  </div>
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

          {!isLoading && !isEmpty(data?.getJobResultStatistics) && (
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
                    {data?.getJobResultStatistics.map((jobResult: any, index: number) => {
                      return (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300 font-medium">
                            {index + 1}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                            {jobResult.earliestTimestamp && !isNaN(parseInt(jobResult.earliestTimestamp))
                              ? format(
                                  new Date(parseInt(jobResult.earliestTimestamp)),
                                  "EEEE, hh:mma, do LLLL y",
                                )
                              : "N/A"}
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
