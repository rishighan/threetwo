import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import prettyBytes from "pretty-bytes";

export const RawFileDetails = (props): ReactElement => {
  const { data } = props;
  return (
    <div className="content comic-detail">
      <dl>
        <dt>Raw File Details</dt>
        <dd className="is-size-7">
          {data.containedIn + "/" + data.name + data.extension}
        </dd>
        <dd>
          <div className="field is-grouped mt-2">
            <div className="control">
              <div className="tags has-addons">
                <span className="tag">Size</span>
                <span className="tag is-info is-light">
                  {prettyBytes(data.fileSize)}
                </span>
              </div>
            </div>
            <div className="control">
              <div className="tags has-addons">
                <span className="tag">Extension</span>
                <span className="tag is-primary is-light">
                  {data.extension}
                </span>
              </div>
            </div>
          </div>
        </dd>
      </dl>
    </div>
  );
};

export default RawFileDetails;

RawFileDetails.propTypes = {
  data: PropTypes.shape({
    containedIn: PropTypes.string,
    name: PropTypes.string,
    fileSize: PropTypes.number,
    path: PropTypes.string,
    extension: PropTypes.string,
    cover: PropTypes.shape({
      filePath: PropTypes.string,
    }),
  }),
};
