import React, { ReactElement, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DnD } from "../../DnD";
import { isEmpty } from "lodash";
import Sticky from "react-stickynode";
import { extractComicArchive } from "../../../actions/comicinfo.actions";

export const ArchiveOperations = (props): ReactElement => {
  const { data } = props;
  const isComicBookExtractionInProgress = useSelector(
    (state: RootState) => state.fileOps.comicBookExtractionInProgress,
  );
  const extractedComicBookArchive = useSelector(
    (state: RootState) => state.fileOps.extractedComicBookArchive,
  );

  const dispatch = useDispatch();
  const unpackComicArchive = useCallback(() => {
    dispatch(
      extractComicArchive(
        data.rawFileDetails.containedIn +
          "/" +
          data.rawFileDetails.name +
          data.rawFileDetails.extension,
        {
          extractTarget: "book",
          targetExtractionFolder:
            "./userdata/expanded/" + data.rawFileDetails.name,
          extractionMode: "all",
        },
      ),
    );
  }, [dispatch, data]);
  return (
    <div key={2}>
      <button
        className={
          isComicBookExtractionInProgress
            ? "button is-loading is-warning"
            : "button is-warning"
        }
        onClick={unpackComicArchive}
      >
        <span className="icon is-small">
          <i className="fa-solid fa-box-open"></i>
        </span>
        <span>Unpack comic archive</span>
      </button>
      <div className="columns">
        <div className="mt-5">
          {!isEmpty(extractedComicBookArchive) ? (
            <DnD data={extractedComicBookArchive} />
          ) : null}
        </div>
        {!isEmpty(extractedComicBookArchive) ? (
          <div className="column mt-5">
            <Sticky enabled={true} top={70} bottomBoundary={3000}>
              <div className="card">
                <div className="card-content">
                  {extractedComicBookArchive.length} pages
                  <button className="button is-small is-light is-primary is-outlined">
                    <span className="icon is-small">
                      <i className="fa-solid fa-compress"></i>
                    </span>
                    <span>Convert to CBZ</span>
                  </button>
                </div>
              </div>
            </Sticky>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ArchiveOperations;
