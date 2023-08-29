import React, { ReactElement, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchComicBookMetadata,
  getImportJobResultStatistics,
  setQueueControl,
} from "../actions/fileops.actions";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { format } from "date-fns";
import Loader from "react-loader-spinner";
import { isEmpty, isNil, isUndefined } from "lodash";

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
  const dispatch = useDispatch();
  const successfulImportJobCount = useSelector(
    (state: RootState) => state.fileOps.successfulJobCount,
  );
  const failedImportJobCount = useSelector(
    (state: RootState) => state.fileOps.failedJobCount,
  );

  const lastQueueJob = useSelector(
    (state: RootState) => state.fileOps.lastQueueJob,
  );
  const libraryQueueImportStatus = useSelector(
    (state: RootState) => state.fileOps.LSQueueImportStatus,
  );

  const allImportJobResults = useSelector(
    (state: RootState) => state.fileOps.importJobStatistics,
  );

  const initiateImport = useCallback(() => {
    if (typeof props.path !== "undefined") {
      dispatch(fetchComicBookMetadata(props.path));
    }
  }, [dispatch]);

  const toggleQueue = useCallback(
    (queueAction: string, queueStatus: string) => {
      dispatch(setQueueControl(queueAction, queueStatus));
    },
    [],
  );

  useEffect(() => {
    dispatch(getImportJobResultStatistics());
  }, []);

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
  console.log(...allImportJobResults);
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
            onClick={initiateImport}
          >
            <span className="icon">
              <i className="fas fa-file-import"></i>
            </span>
            <span>Start Import</span>
          </button>
        </p>
        {libraryQueueImportStatus !== "drained" &&
          !isUndefined(libraryQueueImportStatus) && (
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
                      {successfulImportJobCount > 0 && (
                        <div className="box has-background-success-light has-text-centered">
                          <span className="is-size-2 has-text-weight-bold">
                            {successfulImportJobCount}
                          </span>
                        </div>
                      )}
                    </th>
                    <td>
                      {failedImportJobCount > 0 && (
                        <div className="box has-background-danger has-text-centered">
                          <span className="is-size-2 has-text-weight-bold">
                            {failedImportJobCount}
                          </span>
                        </div>
                      )}
                    </td>

                    <td>{renderQueueControls(libraryQueueImportStatus)}</td>
                    <td>
                      {libraryQueueImportStatus !== undefined ? (
                        <span className="tag is-warning">
                          {libraryQueueImportStatus}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                </tbody>
              </table>
              Imported{" "}
              <span className="has-text-weight-bold">{lastQueueJob}</span>
            </>
          )}

        {/* Past imports */}

        <h3 className="subtitle is-4">Past Imports</h3>
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
            {allImportJobResults.map((jobResult, id) => {
              return (
                <tr key={id}>
                  <td>
                    {format(
                      new Date(jobResult.statuses[0].earliestTimestamp),
                      "EEEE, hh:mma, do LLLL Y",
                    )}
                  </td>
                  <td>
                    <span className="tag is-warning">{jobResult._id}</span>
                  </td>
                  <td>
                    <span className="tag is-success">
                      {jobResult.statuses[1].count}
                    </span>
                  </td>
                  <td>
                    <span className="tag is-danger">
                      {jobResult.statuses[0].count}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Import;
