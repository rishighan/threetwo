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
    <div className="container">
      <section className="section is-small">
        <h1 className="title">Import Comics</h1>
        <article className="message is-dark">
          <div className="message-body">
            <p className="mb-2">
              <span className="tag is-medium is-info is-light">
                Import Comics
              </span>
              will add comics identified from the mapped folder into ThreeTwo's
              database.
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
        <p className="buttons">
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
        </p>

        {importJobQueue.status !== "drained" &&
          !isUndefined(importJobQueue.status) && (
            <>
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
            </>
          )}

        {/* Past imports */}
        {!isLoading && !isEmpty(data?.data) && (
          <>
            <h3 className="subtitle is-4 mt-5">Past Imports</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Time Started</th>
                  <th>Session Id</th>
                  <th>Imported</th>
                  <th>Failed</th>
                </tr>
              </thead>

              <tbody>
                {data?.data.map((jobResult, id) => {
                  return (
                    <tr key={id}>
                      <td>
                        {format(
                          new Date(jobResult.earliestTimestamp),
                          "EEEE, hh:mma, do LLLL Y",
                        )}
                      </td>
                      <td>
                        <span className="tag is-warning">
                          {jobResult.sessionId}
                        </span>
                      </td>
                      <td>
                        <span className="tag is-success">
                          {jobResult.completedJobs}
                        </span>
                      </td>
                      <td>
                        <span className="tag is-danger">
                          {jobResult.failedJobs}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
};

export default Import;
