import React, { ReactElement } from "react";
import ComicVineDetails from "../ComicVineDetails";

export const VolumeInformation = (props): ReactElement => {
  const { data } = props;
  const createDescriptionMarkup = (html) => {
    return { __html: html };
  };

  return (
    <div key={1}>
      <div className="columns is-multiline">
        <ComicVineDetails
          data={data.sourcedMetadata.comicvine}
          updatedAt={data.updatedAt}
        />
        <div
          className="column is-8"
          dangerouslySetInnerHTML={createDescriptionMarkup(
            data.sourcedMetadata.comicvine.volumeInformation.description,
          )}
        ></div>
      </div>
    </div>
  );
};

export default VolumeInformation;
