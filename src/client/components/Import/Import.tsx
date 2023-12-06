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
  const { importJobQueue, socketIOInstance } = useStore(
    useShallow((state) => ({
      importJobQueue: state.importJobQueue,
      socketIOInstance: state.socketIOInstance,
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

  const { data, isError, isLoading } = useQuery({
    queryKey: ["allImportJobResults"],
    queryFn: async () =>
      await axios({
        method: "GET",
        url: "http://localhost:3000/api/jobqueue/getJobResultStatistics",
      }),
  });

  // 1a.  Act on each comic issue successfully imported/failed, as indicated
  //      by the LS_COVER_EXTRACTED/LS_COVER_EXTRACTION_FAILED events
  socketIOInstance.on("LS_COVER_EXTRACTED", (data) => {
    const { completedJobCount, importResult } = data;
    importJobQueue.setJobCount("successful", completedJobCount);
    importJobQueue.setMostRecentImport(importResult.rawFileDetails.name);
  });
  socketIOInstance.on("LS_COVER_EXTRACTION_FAILED", (data) => {
    const { failedJobCount } = data;
    importJobQueue.setJobCount("failed", failedJobCount);
  });

  // 1b.  Clear the localStorage sessionId upon receiving the
  //      LS_IMPORT_QUEUE_DRAINED event
  socketIOInstance.on("LS_IMPORT_QUEUE_DRAINED", (data) => {
    localStorage.removeItem("sessionId");
    importJobQueue.setStatus("drained");
    queryClient.invalidateQueries({ queryKey: ["allImportJobResults"] });
  });
  const toggleQueue = (queueAction: string, queueStatus: string) => {
    socketIOInstance.emit(
      "call",
      "socket.setQueueStatus",
      {
        queueAction,
        queueStatus,
      },
      (data) => console.log(data),
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
          <div className="control">
            <button
              className="button is-warning is-light"
              onClick={() => {
                toggleQueue("pause", "paused");
                importJobQueue.setStatus("paused");
              }}
            >
              <i className="fa-solid fa-pause mr-2"></i> Pause
            </button>
          </div>
        );
      case "paused":
        return (
          <div className="control">
            <button
              className="button is-success is-light"
              onClick={() => {
                toggleQueue("resume", "running");
                importJobQueue.setStatus("running");
              }}
            >
              <i className="fa-solid fa-play mr-2"></i> Resume
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
          <div className="mx-auto max-w-screen-xl px-2 py-2 sm:px-6 sm:py-12 lg:px-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Import
                </h1>

                <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                  Import comics into the ThreeTwo library.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                <button
                  className="block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring"
                  type="button"
                >
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-12 lg:px-8">
          <article
            role="alert"
            className="rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
          >
            <div className="message-body">
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

          {/* <p className="buttons">
            <button
              className={
                importJobQueue.status === "drained" ||
                importJobQueue.status === undefined
                  ? "button is-medium"
                  : "button is-loading is-medium"
              }
              onClick={() => {
                initiateImport();
                importJobQueue.setStatus("running");
              }}
            >
              <span className="icon">
                <i className="fas fa-file-import"></i>
              </span>
              <span>Start Import</span>
            </button>
          </p> */}
          <div className="mt-4">
            <button
              className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-600 bg-green-300 px-5 py-3 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
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
          </div>

          {importJobQueue.status !== "drained" &&
            !isUndefined(importJobQueue.status) && (
              <div className="mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Completed Jobs</th>
                      <th>Failed Jobs</th>
                      <th>Queue Controls</th>
                      <th>Queue Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <th>
                        {importJobQueue.successfulJobCount > 0 && (
                          <div className="box has-background-success-light has-text-centered">
                            <span className="is-size-2 has-text-weight-bold">
                              {importJobQueue.successfulJobCount}
                            </span>
                          </div>
                        )}
                      </th>
                      <td>
                        {importJobQueue.failedJobCount > 0 && (
                          <div className="box has-background-danger has-text-centered">
                            <span className="is-size-2 has-text-weight-bold">
                              {importJobQueue.failedJobCount}
                            </span>
                          </div>
                        )}
                      </td>

                      <td>{renderQueueControls(importJobQueue.status)}</td>
                      <td>
                        {importJobQueue.status !== undefined ? (
                          <span className="tag is-warning">
                            {importJobQueue.status}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  </tbody>
                </table>
                Imported{" "}
                <span className="has-text-weight-bold">
                  {importJobQueue.mostRecentImport}
                </span>
              </div>
            )}

          {/* Past imports */}
          {!isLoading && !isEmpty(data?.data) && (
            <div className="max-w-screen-lg">
              <h3 className="text-xl mt-4">Past Imports</h3>
              <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-200 text-md">
                  <thead className="ltr:text-left rtl:text-right">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Time Started
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Session Id
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Imported
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Failed
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {data?.data.map((jobResult, id) => {
                      return (
                        <tr key={id}>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-400">
                            {format(
                              new Date(jobResult.earliestTimestamp),
                              "EEEE, hh:mma, do LLLL Y",
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-400">
                            <span className="tag is-warning">
                              {jobResult.sessionId}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-400">
                            <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                              <span className="h-5 w-6">
                                <i className="icon-[solar--check-circle-line-duotone] h-5 w-5"></i>
                              </span>

                              <p className="whitespace-nowrap text-sm">
                                {jobResult.completedJobs}
                              </p>
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-400">
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
