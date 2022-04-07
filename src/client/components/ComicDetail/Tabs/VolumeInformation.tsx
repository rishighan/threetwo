import React, { ReactElement } from "react";
import ComicVineDetails from "../ComicVineDetails";
import { convert } from "html-to-text";
import { isEmpty } from "lodash";

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
        <div className="column is-8">
          {!isEmpty(data.sourcedMetadata.comicvine.description) &&
            convert(data.sourcedMetadata.comicvine.description, {
              baseElements: {
                selectors: ["p"],
              },
            })}
        </div>
      </div>
    </div>
  );
};

export default VolumeInformation;
