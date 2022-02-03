import { isArray, map } from "lodash";
import React, { useEffect, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getComicBooksDetailsByIds } from "../../actions/comicinfo.actions";
import { Card } from "../Carda";
import ellipsize from "ellipsize";
import { IMPORT_SERVICE_HOST } from "../../constants/endpoints";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";

const PotentialLibraryMatches = (props): ReactElement => {
  const dispatch = useDispatch();
  const comicBooks = useSelector(
    (state: RootState) => state.comicInfo.comicBooksDetails,
  );
  useEffect(() => {
    dispatch(getComicBooksDetailsByIds(props.matches));
  }, []);
  return (
    <div className="potential-matches-container mt-10">
      {isArray(comicBooks) ? (
        map(comicBooks, (match) => {
          const encodedFilePath = encodeURI(
            `${IMPORT_SERVICE_HOST}/${match.rawFileDetails.cover.filePath}`,
          );
          const filePath = escapePoundSymbol(encodedFilePath);
          return (
            <>
              {/* <pre>{JSON.stringify(match, undefined, 2)}</pre> */}

              <div className="columns">
                <div className="column is-one-fifth">
                  <Card
                    imageUrl={filePath}
                    orientation={"vertical"}
                    hasDetails={false}
                  />
                </div>

                <div className="search-result-details column">
                  <div className="is-size-5">{match.rawFileDetails.name}</div>
                  <span className="subtitle is-size-7">
                    {match.rawFileDetails.cover.filePath}
                  </span>
                  <div className="field is-grouped is-grouped-multiline mt-4">
                    <div className="control">
                      <div className="tags has-addons">
                        <span className="tag">File Type</span>
                        <span className="tag is-primary">
                          {match.rawFileDetails.extension}
                        </span>
                      </div>
                    </div>
                    <div className="control">
                      <div className="tags has-addons">
                        <span className="tag">File Size</span>
                        <span className="tag is-warning">
                          {match.rawFileDetails.fileSize}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* <div className="is-size-7">
                  {ellipsize(issueDescription, 300)}
                </div> */}
                </div>
              </div>
            </>
          );
        })
      ) : (
        <div>asdasd</div>
      )}
    </div>
  );
};

export default PotentialLibraryMatches;
