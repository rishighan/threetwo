import React, { ReactElement, useCallback } from "react";
import { isNil, isUndefined } from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { fetchComicBookMetadata } from "../actions/fileops.actions";
import { IFolderData } from "threetwo-ui-typings";
import DynamicList, { createCache } from "react-window-dynamic-list";
;

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
  const isSocketConnected = useSelector((state: RootState) => {
    console.log(state);
    return state.fileOps.isSocketConnected;
  });

  const initiateImport = useCallback(() => {
    if (typeof props.path !== "undefined") {
      console.log("asdasd");
      dispatch(fetchComicBookMetadata(props.path));
    }
  }, [dispatch]);

  return (
    <div className="container">
      <section className="section is-small">
        <h1 className="title">Import</h1>
        {isSocketConnected}
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
          <button className="button is-medium" onClick={initiateImport}>
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
      </section>
    </div>
  );
};

export default Import;
