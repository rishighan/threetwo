import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";

// raw file details
export const RawFileDetails = (rawFileData): ReactElement => {
  const { data } = rawFileData;
  const encodedFilePath = encodeURI(
    `${LIBRARY_SERVICE_HOST}/${data.cover.filePath}`,
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
              {ellipsize(data.name, 28)}
            </li>
            <li>
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag is-primary is-light">
                    {data.extension}
                  </span>
                  <span className="tag is-info is-light">
                    {prettyBytes(data.fileSize)}
                  </span>
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
