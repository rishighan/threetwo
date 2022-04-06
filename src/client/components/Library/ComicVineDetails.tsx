import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import ellipsize from "ellipsize";
import Card from "../Carda";
import convert from "html-to-text";

export const ComicVineDetails = (comicVineData): ReactElement => {
  const { data } = comicVineData;
  console.log(data);
  return (
    <div className="columns">
      <div className="column">
        <div className="comic-detail issue-metadata">
          <dl>
            <dd>
              <div className="columns mt-2">
                <div className="column is-3">
                  <Card
                    imageUrl={data.comicvine.image.thumb_url}
                    orientation={"vertical"}
                    hasDetails={false}
                    // cardContainerStyle={{ maxWidth: 200 }}
                  />
                </div>
                <div className="column">
                  <dl>
                    <dt>
                      <h6 className="name has-text-weight-medium mb-1">
                        {ellipsize(data.name, 18)}
                      </h6>
                    </dt>
                    <dd>
                      <h6>{data.comicvine.name && data.comicvine.name}</h6>
                      <span className="is-size-7">
                        Is a part of{" "}
                        <span className="has-text-weight-semibold">
                          {data.comicvine.volumeInformation.name}
                        </span>
                      </span>
                    </dd>

                    <dd className="is-size-7 mt-2">
                      <div className="field is-grouped is-grouped-multiline">
                        <div className="control">
                          <span className="tags">
                            <span className="tag is-success is-light has-text-weight-semibold">
                              {data.comicvine.volumeInformation.start_year}
                            </span>
                            <span className="tag is-success is-light">
                              {data.comicvine.volumeInformation.count_of_issues}
                            </span>
                          </span>
                        </div>
                        <div className="control">
                          <div className="tags has-addons">
                            <span className="tag is-primary is-light">
                              ComicVine ID
                            </span>
                            <span className="tag is-info is-light">
                              {data.comicvine.id}
                            </span>
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
    </div>
  );
};

export default ComicVineDetails;
