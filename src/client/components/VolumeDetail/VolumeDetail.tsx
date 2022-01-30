import { isUndefined } from "lodash";
import React, { useEffect, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  getComicBookDetailById,
  getIssuesForSeries,
} from "../../actions/comicinfo.actions";
import Masonry from "react-masonry-css";
import { Card } from "../Carda";

const VolumeDetails = (props): ReactElement => {
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 2,
    600: 1,
  };
  const comicBookDetails = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );
  const issues = useSelector(
    (state: RootState) => state.comicInfo.issuesForVolume,
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getIssuesForSeries(comicObjectId));
    dispatch(getComicBookDetailById(comicObjectId));
  }, []);

  const { comicObjectId } = useParams<{ comicObjectId: string }>();

  if (
    !isUndefined(comicBookDetails.sourcedMetadata) &&
    !isUndefined(comicBookDetails.sourcedMetadata.comicvine)
  ) {
    return (
      <div className="container volume-details">
        <div className="section">
          <h1 className="title">
            {comicBookDetails.sourcedMetadata.comicvine.volumeInformation.name}
          </h1>
          <div className="columns is-multiline">
            <div className="column is-narrow is-full">
              <Card
                imageUrl={
                  comicBookDetails.sourcedMetadata.comicvine.volumeInformation
                    .image.small_url
                }
                orientation={"vertical"}
                hasDetails={false}
              />
            </div>
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="issues-container"
              columnClassName="issues-column"
            >
              {issues.map((issue) => {
                return (
                  <Card
                    key={issue.id}
                    imageUrl={issue.image.thumb_url}
                    orientation={"vertical"}
                    hasDetails={false}
                  />
                );
              })}
            </Masonry>
            {/* <pre>{JSON.stringify(comicBookDetails, undefined, 2)}</pre> */}
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default VolumeDetails;
