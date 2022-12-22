import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import prettyBytes from "pretty-bytes";
import { isUndefined } from "lodash";

export const RawFileDetails = (props): ReactElement => {
  const { rawFileDetails, inferredMetadata } = props.data;
  return (
    <>
      <div className="comic-detail raw-file-details column is-three-fifths">
        <dl>
          <dt>Raw File Details</dt>
          <dd className="is-size-7">
            {rawFileDetails.containedIn +
              "/" +
              rawFileDetails.name +
              rawFileDetails.extension}
          </dd>
          <dd>
            <div className="field is-grouped mt-2">
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag">Size</span>
                  <span className="tag is-info is-light">
                    {prettyBytes(rawFileDetails.fileSize)}
                  </span>
                </div>
              </div>
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag">Extension</span>
                  <span className="tag is-primary is-light">
                    {rawFileDetails.extension}
                  </span>
                </div>
              </div>
            </div>
          </dd>
        </dl>
      </div>

      <div className="content comic-detail raw-file-details mt-3 column is-three-fifths">
        <dl>
          {/* inferred metadata */}
          <dt>Inferred Issue Metadata</dt>
          <dd>
            <div className="field is-grouped mt-2">
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag">Name</span>
                  <span className="tag is-info is-light">
                    {inferredMetadata.issue.name}
                  </span>
                </div>
              </div>
              {!isUndefined(inferredMetadata.issue.number) ? (
                <div className="control">
                  <div className="tags has-addons">
                    <span className="tag">Number</span>
                    <span className="tag is-primary is-light">
                      {inferredMetadata.issue.number}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </dd>
        </dl>
      </div>
    </>
  );
};

export default RawFileDetails;

RawFileDetails.propTypes = {
  data: PropTypes.shape({
    rawFileDetails: PropTypes.shape({
      containedIn: PropTypes.string,
      name: PropTypes.string,
      fileSize: PropTypes.number,
      path: PropTypes.string,
      extension: PropTypes.string,
      cover: PropTypes.shape({
        filePath: PropTypes.string,
      }),
    }),
    inferredMetadata: PropTypes.shape({
      issue: PropTypes.shape({
        year: PropTypes.string,
        name: PropTypes.string,
        number: PropTypes.number,
        subtitle: PropTypes.string,
      }),
    }),
  }),
};