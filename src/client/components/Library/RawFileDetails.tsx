import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";

// raw file details
export const RawFileDetails = (rawFileData): ReactElement => {
  const { rawFileDetails, inferredMetadata } = rawFileData.data;
  const encodedFilePath = encodeURI(
    `${LIBRARY_SERVICE_HOST}/${rawFileDetails.cover.filePath}`,
  );
  const filePath = escapePoundSymbol(encodedFilePath);
  return (
    <div className="card-container">
      <div className="card">
        <div className="is-horizontal">
          <div className="card-image">
            <figure>
              <img className="image" src={filePath} />
            </figure>
          </div>
          <ul className="card-content">
            <li className="name has-text-weight-medium">
              {ellipsize(rawFileDetails.name, 49)}
            </li>

            <li>
              <dl className="is-size-7">
                <dd>
                  Series:{" "}
                  <span className="has-text-weight-medium">
                    {inferredMetadata.issue.name}
                  </span>
                </dd>
              </dl>
            </li>
            <li>
              <div className="mt-1 field is-grouped is-grouped-multiline">
                <div className="control">
                  <div className="tags">
                    <span className="tag is-warning is-light">
                      {inferredMetadata.issue.number}
                    </span>

                    <span className="tag is-success is-light">
                      {rawFileDetails.extension}
                    </span>
                    <span className="tag">
                      {prettyBytes(rawFileDetails.fileSize)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RawFileDetails;

RawFileDetails.propTypes = {
  data: PropTypes.shape({
    cover: PropTypes.shape({
      filePath: PropTypes.string,
    }),
    name: PropTypes.string,
    path: PropTypes.string,
    fileSize: PropTypes.number,
    extension: PropTypes.string,
  }),
};
