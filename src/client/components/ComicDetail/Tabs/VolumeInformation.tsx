import React, { ReactElement } from "react";
import ComicVineDetails from "../ComicVineDetails";

export const VolumeInformation = (props): ReactElement => {
  const { data } = props;

  return (
    <div key={1}>
      <ComicVineDetails
        data={data.sourcedMetadata.comicvine}
        updatedAt={data.updatedAt}
      />
    </div>
  );
};

export default VolumeInformation;
