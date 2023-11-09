import React, { ReactElement, useCallback, useEffect } from "react";
import {
  fetchComicBookMetadata,
  getImportJobResultStatistics,
  setQueueControl,
} from "../../actions/fileops.actions";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { format } from "date-fns";
import Loader from "react-loader-spinner";
import { isEmpty, isNil, isUndefined } from "lodash";
import { useQuery, useMutation } from "@tanstack/react-query";
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
 * Returns the average of two numbers.
 *
 * @remarks
 * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
 */

export const Import = (props: IProps): ReactElement => {
  const { importJobQueue, socketIOInstance } = useStore(
    useShallow((state) => ({
      importJobQueue: state.importJobQueue,
      socketIOInstance: state.socketIOInstance,
    })),
  );
  //   const successfulImportJobCount = useSelector(
  //     (state: RootState) => state.fileOps.successfulJobCount,
  //   );
  //   const failedImportJobCount = useSelector(
  //     (state: RootState) => state.fileOps.failedJobCount,
  //   );
  //
  //   const lastQueueJob = useSelector(
  //     (state: RootState) => state.fileOps.lastQueueJob,
  //   );
  //   const libraryQueueImportStatus = useSelector(
  //     (state: RootState) => state.fileOps.LSQueueImportStatus,
  //   );
  //
  //   const allImportJobResults = useSelector(
  //     (state: RootState) => state.fileOps.importJobStatistics,
  //   );

  const sessionId = localStorage.getItem("sessionId");
  const { mutate: initiateImport } = useMutation({
    mutationFn: async () =>
      await axios.request({
        url: `http://localhost:3000/api/library/newImport`,
        method: "POST",
        data: { sessionId },
      }),
  });

  // Act on each comic issue successfully imported, as indicated
  // by the LS_COVER_EXTRACTED event
  socketIOInstance.on("LS_COVER_EXTRACTED", (data) => {
    const { completedJobCount } = data;
    importJobQueue.setJobCount("successful", completedJobCount);
  });
  socketIOInstance.on("LS_COVER_EXTRACTION_FAILED", (data) => {
    console.log(data);
    const { failedJobCount } = data;
    importJobQueue.setJobCount("failed", failedJobCount);
  });
  const toggleQueue = useCallback(
    (queueAction: string, queueStatus: string) => {
      // dispatch(setQueueControl(queueAction, queueStatus));
    },
    [],
  );
  useEffect(() => {
    // dispatch(getImportJobResultStatistics());
  }, []);

  const libraryQueueImportStatus = undefined;
  const renderQueueControls = (status: string): ReactElement | null => {
    switch (status) {
      case "running":
        return (
          <div className="control">
            <button
              className="button is-warning is-light"
              onClick={() => toggleQueue("pause", "paused")}
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
              onClick={() => toggleQueue("resume", "running")}
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
              libraryQueueImportStatus === "drained" ||
              libraryQueueImportStatus === undefined
                ? "button is-medium"
                : "button is-loading is-medium"
            }
            onClick={() => initiateImport()}
          >
            <span className="icon">
              <i className="fas fa-file-import"></i>
            </span>
            <span>Start Import</span>
          </button>
        </p>

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

                {/* <td>{renderQueueControls(libraryQueueImportStatus)}</td>
                    <td>
                      {libraryQueueImportStatus !== undefined ? (
                        <span className="tag is-warning">
                          {libraryQueueImportStatus}
                        </span>
                      ) : null}
                    </td> */}
              </tr>
            </tbody>
          </table>
          Imported{" "}
          {/* <span className="has-text-weight-bold">{lastQueueJob}</span> */}
        </>

        {/* Past imports */}

        <h3 className="subtitle is-4 mt-5">Past Imports</h3>
        {/* <table className="table">
          <thead>
            <tr>
              <th>Time Started</th>
              <th>Session Id</th>
              <th>Imported</th>
              <th>Failed</th>
            </tr>
          </thead>

          <tbody>
            {allImportJobResults.map((jobResult, id) => {
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
        </table> */}
      </section>
    </div>
  );
};

export default Import;
