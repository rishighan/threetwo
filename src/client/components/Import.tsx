import React, { ReactElement, useCallback, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchComicBookMetadata,
  setQueueControl,
} from "../actions/fileops.actions";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import { isUndefined } from "lodash";
import {
  LS_IMPORT_CALL_IN_PROGRESS,
  LS_SET_QUEUE_STATUS,
} from "../constants/action-types";

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
  const libraryQueueResults = useSelector(
    (state: RootState) => state.fileOps.librarySearchResultCount,
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
            {JSON.stringify(libraryQueueImportStatus)}
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
        <table className="table">
          <thead>
            <tr>
              <th>
                <abbr title="Position">Completed Jobs</abbr>
              </th>
              <th>Failed Jobs</th>
              <th>
                <abbr title="Played">Queue Controls</abbr>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th>
                {libraryQueueResults && (
                  <div className="box has-background-success-light has-text-centered">
                    <span className="is-size-2 has-text-weight-bold">
                      {libraryQueueResults}
                    </span>
                  </div>
                )}
              </th>
              <td>
                {!isUndefined(failedImportJobCount) && (
                  <div className="box has-background-danger has-text-centered">
                    <span className="is-size-2 has-text-weight-bold">
                      {failedImportJobCount}
                    </span>
                  </div>
                )}
              </td>

              <td>{renderQueueControls(libraryQueueImportStatus)}</td>
            </tr>
          </tbody>
        </table>
        Imported <span className="has-text-weight-bold">{lastQueueJob}</span>
      </section>
    </div>
  );
};

export default Import;
