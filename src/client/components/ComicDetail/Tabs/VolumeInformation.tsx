import React, { ReactElement } from "react";

export const VolumeInformation = (props): ReactElement => {
  const { data } = props;
  const createDescriptionMarkup = (html) => {
    return { __html: html };
  };

  return (
    <div key={1}>
      <div className="columns">
        <div className="column is-narrow">
          <figure className="card-image">
            <img
              src={
                data.sourcedMetadata.comicvine.volumeInformation.image.thumb_url
              }
            />
          </figure>
        </div>
        <div className="column is-4">
          <dl>
            <dt>
              Is a part of{" "}
              <span className="has-text-info">
                {data.sourcedMetadata.comicvine.volumeInformation.name}
              </span>
            </dt>
            <dd>
              Published by
              <span className="has-text-weight-semibold">
                {" "}
                {
                  data.sourcedMetadata.comicvine.volumeInformation.publisher
                    .name
                }
              </span>
            </dd>
            <dd>
              Total issues in this volume:
              {data.sourcedMetadata.comicvine.volumeInformation.count_of_issues}
            </dd>
          </dl>
        </div>
      </div>
      <div className="columns">
        <div
          className="column is-three-quarters"
          dangerouslySetInnerHTML={createDescriptionMarkup(
            data.sourcedMetadata.comicvine.volumeInformation.description,
          )}
        ></div>
      </div>
    </div>
  );
};

export default VolumeInformation;
