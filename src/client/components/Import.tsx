import React, { ReactElement, useCallback, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchComicBookMetadata,
  toggleImportQueueStatus,
} from "../actions/fileops.actions";
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
  const failedImportJobCount = useSelector(
    (state: RootState) => state.fileOps.failedImportJobCount,
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
  const pauseIconText = (
    <>
      <i className="fa-solid fa-pause mr-2"></i> Pause Import
    </>
  );
  const playIconText = (
    <>
      <i className="fa-solid fa-play mr-2"></i> Resume Import
    </>
  );
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
              libraryQueueImportStatus
                ? "button is-loading is-medium"
                : "button is-medium"
            }
            onClick={initiateImport}
          >
            <span className="icon">
              <i className="fas fa-file-import"></i>
            </span>
            <span>Start Import</span>
          </button>
        </p>
        <div className="columns is-multiline is-half">
          <div className="column is-2 has-text-centered">
            <div className="box has-background-success-light">
              <span className="is-size-2 has-text-weight-bold">
                {libraryQueueResults}
              </span>
            </div>
          </div>
          <div className="column is-2 has-text-centered">
            <div className="box has-background-danger">
              <span className="is-size-2 has-text-weight-bold">
                {failedImportJobCount}
              </span>
            </div>
          </div>

          <div className="column">
            <div className="content">
              <div className="control">
                <button
                  className="button is-warning is-light"
                  onClick={toggleImport}
                >
                  {!isImportQueuePaused ? pauseIconText : playIconText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Import;
