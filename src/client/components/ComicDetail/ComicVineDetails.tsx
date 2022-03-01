import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import dayjs from "dayjs";
import { isUndefined } from "lodash";
import Card from "../Carda";
export const ComicVineDetails = (props): ReactElement => {
  const { data, updatedAt } = props;
  return (
    <div className="column is-two-thirds">
      <div className="comic-detail comicvine-metadata">
        <dl>
          <dt>ComicVine Metadata</dt>
          <dd className="is-size-7">
            Last scraped on {dayjs(updatedAt).format("MMM D YYYY [at] h:mm a")}
          </dd>

          <dd>
            <div className="columns mt-2">
              <div className="column is-2">
                <Card
                  imageUrl={data.volumeInformation.image.thumb_url}
                  orientation={"vertical"}
                  hasDetails={false}
                  // cardContainerStyle={{ maxWidth: 200 }}
                />
              </div>
              <div className="column is-10">
                <dl>
                  <dt>
                    <h6 className="has-text-weight-bold mb-2">{data.name}</h6>
                  </dt>
                  <dd>
                    Is a part of{" "}
                    <span className="has-text-info">
                      {data.volumeInformation.name}
                    </span>
                  </dd>

                  <dd>
                    Published by
                    <span className="has-text-weight-semibold">
                      {" "}
                      {data.volumeInformation.publisher.name}
                    </span>
                  </dd>
                  <dd>
                    Total issues in this volume:
                    {data.volumeInformation.count_of_issues}
                  </dd>

                  <dd>
                    <div className="field is-grouped mt-2">
                      {data.issue_number && (
                        <div className="control">
                          <div className="tags has-addons">
                            <span className="tag is-light">Issue Number</span>
                            <span className="tag is-warning">
                              {data.issue_number}
                            </span>
                          </div>
                        </div>
                      )}
                      {!isUndefined(
                        detectIssueTypes(data.volumeInformation.description),
                      ) ? (
                        <div className="control">
                          <div className="tags has-addons">
                            <span className="tag is-light">Detected Type</span>
                            <span className="tag is-warning">
                              {
                                detectIssueTypes(
                                  data.volumeInformation.description,
                                ).displayName
                              }
                            </span>
                          </div>
                        </div>
                      ) : data.resource_type ? (
                        <div className="control">
                          <div className="tags has-addons">
                            <span className="tag is-light">Type</span>
                            <span className="tag is-warning">
                              {data.resource_type}
                            </span>
                          </div>
                        </div>
                      ) : null}
                      <div className="control">
                        <div className="tags has-addons">
                          <span className="tag is-light">
                            ComicVine Issue ID
                          </span>
                          <span className="tag is-success">{data.id}</span>
                        </div>
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
  );
};

export default ComicVineDetails;

ComicVineDetails.propTypes = {
  updatedAt: PropTypes.string,
  data: PropTypes.shape({
    name: PropTypes.string,
    number: PropTypes.string,
    resource_type: PropTypes.string,
    id: PropTypes.number,
  }),
};
