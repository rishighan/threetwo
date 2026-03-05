import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { isEmpty, isNil, isUndefined } from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import axios from "axios";
import {
  useGetJobResultStatisticsQuery,
  useGetImportStatisticsQuery,
  useStartIncrementalImportMutation
} from "../../graphql/generated";

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
  const [showPreview, setShowPreview] = useState(false);
  const { importJobQueue, getSocket, disconnectSocket } = useStore(
    useShallow((state) => ({
      importJobQueue: state.importJobQueue,
      getSocket: state.getSocket,
      disconnectSocket: state.disconnectSocket,
    })),
  );

  const {
    data: importStats,
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = useGetImportStatisticsQuery(
    {},
    {
      enabled: showPreview,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: startIncrementalImport, isPending: isStartingImport } = useStartIncrementalImportMutation({
    onSuccess: (data) => {
      if (data.startIncrementalImport.success) {
        importJobQueue.setStatus("running");
        setShowPreview(false);
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

  const handleShowPreview = () => {
    setShowPreview(true);
    refetchStats();
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

          {!showPreview && (importJobQueue.status === "drained" || importJobQueue.status === undefined) && (
            <div className="my-4 flex gap-3">
              <button
                className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-blue-400 dark:border-blue-200 bg-blue-200 px-5 py-3 text-gray-500 hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
                onClick={handleShowPreview}
              >
                <span className="text-md">Preview Import</span>
                <span className="w-6 h-6">
                  <i className="h-6 w-6 icon-[solar--eye-bold-duotone]"></i>
                </span>
              </button>
            </div>
          )}
          {/* Import Preview Panel */}
          {showPreview && !isLoadingStats && importStats?.getImportStatistics && (
            <div className="my-6 max-w-screen-lg">
              <span className="flex items-center my-5">
                <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
                  Import Preview
                </span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
              </span>

              <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Directory:</span> {importStats.getImportStatistics.directory}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col rounded-lg bg-blue-100 dark:bg-blue-200 px-4 py-6 text-center">
                    <dd className="text-3xl text-blue-600 md:text-5xl">
                      {importStats.getImportStatistics.stats.totalLocalFiles}
                    </dd>
                    <dt className="text-lg font-medium text-gray-500">
                      Total Files
                    </dt>
                  </div>

                  <div className="flex flex-col rounded-lg bg-green-100 dark:bg-green-200 px-4 py-6 text-center">
                    <dd className="text-3xl text-green-600 md:text-5xl">
                      {importStats.getImportStatistics.stats.newFiles}
                    </dd>
                    <dt className="text-lg font-medium text-gray-500">
                      New Comics
                    </dt>
                  </div>

                  <div className="flex flex-col rounded-lg bg-yellow-100 dark:bg-yellow-200 px-4 py-6 text-center">
                    <dd className="text-3xl text-yellow-600 md:text-5xl">
                      {importStats.getImportStatistics.stats.alreadyImported}
                    </dd>
                    <dt className="text-lg font-medium text-gray-500">
                      Already Imported
                    </dt>
                  </div>

                  <div className="flex flex-col rounded-lg bg-purple-100 dark:bg-purple-200 px-4 py-6 text-center">
                    <dd className="text-3xl text-purple-600 md:text-5xl">
                      {(() => {
                        const percentage = importStats.getImportStatistics.stats.percentageImported;
                        const numValue = typeof percentage === 'number' ? percentage : parseFloat(percentage);
                        return !isNaN(numValue) ? numValue.toFixed(1) : '0.0';
                      })()}%
                    </dd>
                    <dt className="text-lg font-medium text-gray-500">
                      Already in Library
                    </dt>
                  </div>
                </dl>

                {importStats.getImportStatistics.stats.newFiles > 0 && (
                  <div className="mt-6">
                    <article
                      role="alert"
                      className="rounded-lg border-s-4 border-green-500 bg-green-50 p-4 dark:border-s-4 dark:border-green-600 dark:bg-green-300 dark:text-slate-600"
                    >
                      <p className="font-medium">
                        Ready to import {importStats.getImportStatistics.stats.newFiles} new comic{importStats.getImportStatistics.stats.newFiles !== 1 ? 's' : ''}!
                      </p>
                      <p className="text-sm mt-1">
                        {importStats.getImportStatistics.stats.alreadyImported} comic{importStats.getImportStatistics.stats.alreadyImported !== 1 ? 's' : ''} will be skipped (already in library).
                      </p>
                    </article>
                  </div>
                )}

                {importStats.getImportStatistics.stats.newFiles === 0 && (
                  <div className="mt-6">
                    <article
                      role="alert"
                      className="rounded-lg border-s-4 border-yellow-500 bg-yellow-50 p-4 dark:border-s-4 dark:border-yellow-600 dark:bg-yellow-300 dark:text-slate-600"
                    >
                      <p className="font-medium">
                        No new comics to import!
                      </p>
                      <p className="text-sm mt-1">
                        All {importStats.getImportStatistics.stats.totalLocalFiles} comic{importStats.getImportStatistics.stats.totalLocalFiles !== 1 ? 's' : ''} in the directory {importStats.getImportStatistics.stats.totalLocalFiles !== 1 ? 'are' : 'is'} already in your library.
                      </p>
                    </article>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  {importStats.getImportStatistics.stats.newFiles > 0 && (
                    <button
                      className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-5 py-3 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-green-500"
                      onClick={handleStartSmartImport}
                      disabled={isStartingImport}
                    >
                      <span className="text-md">
                        {isStartingImport ? "Starting..." : "Start Smart Import"}
                      </span>
                      <span className="w-6 h-6">
                        <i className="h-6 w-6 icon-[solar--file-left-bold-duotone]"></i>
                      </span>
                    </button>
                  )}
                  <button
                    className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-gray-400 dark:border-gray-200 bg-gray-200 px-5 py-3 text-gray-500 hover:bg-transparent hover:text-gray-600 focus:outline-none focus:ring active:text-gray-500"
                    onClick={() => setShowPreview(false)}
                  >
                    <span className="text-md">Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPreview && isLoadingStats && (
            <div className="my-6 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Analyzing comics folder...
              </span>
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
