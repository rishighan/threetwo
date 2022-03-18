import React, { ReactElement, useCallback, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchComicBookMetadata,
  toggleImportQueueStatus,
} from "../actions/fileops.actions";
import DynamicList, { createCache } from "react-window-dynamic-list";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

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
  const libraryQueueImportStatus = useSelector(
    (state: RootState) => state.fileOps.IMSCallInProgress,
  );
  const [isImportQueuePaused, setImportQueueStatus] = useState(false);
  const initiateImport = useCallback(() => {
    if (typeof props.path !== "undefined") {
      dispatch(fetchComicBookMetadata(props.path));
    }
  }, [dispatch]);

  const toggleImport = useCallback(() => {
    setImportQueueStatus(!isImportQueuePaused);
    if (isImportQueuePaused === false) {
      dispatch(toggleImportQueueStatus({ action: "resume" }));
    } else if (isImportQueuePaused === true) {
      dispatch(toggleImportQueueStatus({ action: "pause" }));
    }
  }, [isImportQueuePaused]);

  return (
    <div className="container">
      <section className="section is-small">
        <h1 className="title">Import</h1>
        <article className="message is-dark">
          <div className="message-body">
            <p className="mb-2">
              <span className="tag is-medium is-info is-light">
                Import Only
              </span>
              will add comics identified from the mapped folder into the local
              db.
            </p>
            <p>
              <span className="tag is-medium is-info is-light">
                Import and Tag
              </span>
              will scan the ComicVine, shortboxed APIs and import comics from
              the mapped folder with the additional metadata.
            </p>
          </div>
        </article>
        <p className="buttons">
          <button
            className={
              libraryQueueImportStatus
                ? "button is-loading is-medium"
                : "button is-medium"
            }
            onClick={initiateImport}
          >
            <span className="icon">
              <i className="fas fa-file-import"></i>
            </span>
            <span>Import Only</span>
          </button>

          <button className="button is-medium">
            <span className="icon">
              <i className="fas fa-tag"></i>
            </span>
            <span>Import and Tag</span>
          </button>
        </p>

        <pre>{JSON.stringify(libraryQueueResults, null, 2)}</pre>
        <button className="button is-warning" onClick={toggleImport}>
          Pause Queue
        </button>
      </section>
    </div>
  );
};

export default Import;
