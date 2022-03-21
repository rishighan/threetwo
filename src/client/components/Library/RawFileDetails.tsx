import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { Card } from "../Carda";

// raw file details
export const RawFileDetails = (rawFileData): ReactElement => {
  const { rawFileDetails, inferredMetadata } = rawFileData.data;
  const encodedFilePath = encodeURI(
    `${LIBRARY_SERVICE_HOST}/${rawFileDetails.cover.filePath}`,
  );
  const filePath = escapePoundSymbol(encodedFilePath);
  return (
    <div className="columns">
      <div className="column">
        <div className="comic-detail issue-metadata">
          <dl>
            <dd>
              <div className="columns mt-2">
                <div className="column is-3">
                  <Card
                    imageUrl={filePath}
                    orientation={"vertical"}
                    hasDetails={false}
                    // cardContainerStyle={{ maxWidth: 200 }}
                  />
                </div>
                <div className="column">
                  <dl>
                    <dt>
                      <h6 className="name has-text-weight-medium mb-1">
                        {rawFileDetails.name}
                      </h6>
                    </dt>
                    <dd className="is-size-7">
                      Is a part of{" "}
                      <span className="has-text-weight-semibold">
                        {inferredMetadata.issue.name}
                      </span>
                    </dd>

                    <dd className="is-size-7 mt-2">
                      <div className="field is-grouped is-grouped-multiline">
                        <div className="control">
                          <span className="tags">
                            <span className="tag is-success is-light has-text-weight-semibold">
                              {rawFileDetails.extension}
                            </span>
                            <span className="tag is-success is-light">
                              {prettyBytes(rawFileDetails.fileSize)}
                            </span>
                          </span>
                        </div>
                        <div className="control">
                          {inferredMetadata.issue.number && (
                            <div className="tags has-addons">
                              <span className="tag is-light">Issue #</span>
                              <span className="tag is-warning">
                                {inferredMetadata.issue.number}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </dd>
          </dl>
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
