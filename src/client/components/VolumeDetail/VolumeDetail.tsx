import { isUndefined } from "lodash";
import React, { useEffect, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  getComicBookDetailById,
  getIssuesForSeries,
} from "../../actions/comicinfo.actions";
import { Card } from "../Carda";

const VolumeDetails = (props): ReactElement => {
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
      <div className="container">
        <div className="section">
          <h1 className="title">
            {comicBookDetails.sourcedMetadata.comicvine.volumeInformation.name}
          </h1>
          <div className="columns is-multiline">
            <div className="column is-narrow">
              <Card
                imageUrl={
                  comicBookDetails.sourcedMetadata.comicvine.volumeInformation
                    .image.small_url
                }
                orientation={"vertical"}
                hasDetails={false}
              />
            </div>
            <div>
              {issues.map((issue, idx) => {
                return <img key={idx} src={issue.image.thumb_url} />;
              })}
            </div>
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
