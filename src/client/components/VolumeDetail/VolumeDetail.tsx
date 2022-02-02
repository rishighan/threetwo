import { isEmpty, isNil, isUndefined, map } from "lodash";
import React, { useEffect, ReactElement, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  getComicBookDetailById,
  findIssuesForSeriesInLibrary,
} from "../../actions/comicinfo.actions";
import Masonry from "react-masonry-css";
import { Card } from "../Carda";
import SlidingPane from "react-sliding-pane";

const VolumeDetails = (props): ReactElement => {
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 2,
    600: 1,
  };
  // sliding panel config
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");
  const [matches, setMatches] = useState([]);

  // sliding panel init
  const contentForSlidingPanel = {
    potentialMatchesInLibrary: {
      content: () => {
        console.log(matches);

        return (
          <div className="mt-10">
            {map(matches, (match) => (
              <pre>{JSON.stringify(match, undefined, 2)}</pre>
            ))}
          </div>
        );
      },
    },
  };

  // sliding panel handlers
  const openPotentialLibraryMatchesPanel = useCallback((potentialMatches) => {
    setSlidingPanelContentId("potentialMatchesInLibrary");
    setMatches(potentialMatches);
    setVisible(true);
  }, []);

  const comicBookDetails = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );
  const issuesForVolume = useSelector(
    (state: RootState) => state.comicInfo.issuesForVolume,
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(findIssuesForSeriesInLibrary(comicObjectId));
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
              {!isUndefined(issuesForVolume) && !isEmpty(issuesForVolume)
                ? issuesForVolume.map((issue) => {
                    return (
                      <>
                        <Card
                          key={issue.issue.id}
                          imageUrl={issue.issue.image.thumb_url}
                          orientation={"vertical"}
                          hasDetails={!isEmpty(issue.matches) ? true : false}
                          borderColorClass={
                            !isEmpty(issue.matches) ? "green-border" : ""
                          }
                          backgroundColor={
                            !isEmpty(issue.matches) ? "#e0f5d0" : ""
                          }
                          onClick={() =>
                            openPotentialLibraryMatchesPanel(issue.matches)
                          }
                        >
                          {!isEmpty(issue.matches) ? (
                            <span className="icon is-success">
                              <i className="fa-solid fa-hands-asl-interpreting"></i>
                            </span>
                          ) : null}
                        </Card>
                        {/* { JSON.stringify(issue, undefined, 2)} */}
                      </>
                    );
                  })
                : "loading"}
            </Masonry>
            {/* <pre>{JSON.stringify(issuesForVolume, undefined, 2)}</pre> */}
          </div>
        </div>

        <SlidingPane
          isOpen={visible}
          onRequestClose={() => setVisible(false)}
          title={"Potential Matches in Library"}
          width={"600px"}
        >
          {slidingPanelContentId !== "" &&
            contentForSlidingPanel[slidingPanelContentId].content()}
        </SlidingPane>
      </div>
    );
  } else {
    return <></>;
  }
};

export default VolumeDetails;
