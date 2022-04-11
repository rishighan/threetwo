import { isEmpty, isUndefined, map, partialRight, pick } from "lodash";
import React, { useEffect, ReactElement, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  getComicBookDetailById,
  getIssuesForSeries,
  analyzeLibrary,
} from "../../actions/comicinfo.actions";
import PotentialLibraryMatches from "./PotentialLibraryMatches";
import Masonry from "react-masonry-css";
import { Card } from "../Carda";
import SlidingPane from "react-sliding-pane";
import { convert } from "html-to-text";
import ellipsize from "ellipsize";

const VolumeDetails = (props): ReactElement => {
  const breakpointColumnsObj = {
    default: 6,
    1100: 4,
    700: 3,
    500: 2,
  };
  // sliding panel config
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");
  const [matches, setMatches] = useState([]);
  const [active, setActive] = useState(1);

  // sliding panel init
  const contentForSlidingPanel = {
    potentialMatchesInLibrary: {
      content: () => {
        const ids = map(matches, partialRight(pick, "_id"));
        const matchIds = ids.map((id: any) => id._id);
        return <PotentialLibraryMatches matches={matchIds} />;
      },
    },
  };

  // sliding panel handlers
  const openPotentialLibraryMatchesPanel = useCallback((potentialMatches) => {
    setSlidingPanelContentId("potentialMatchesInLibrary");
    setMatches(potentialMatches);
    setVisible(true);
  }, []);

  const analyzeIssues = useCallback((issues) => {
    dispatch(analyzeLibrary(issues));
  }, []);

  const comicBookDetails = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );
  const issuesForVolume = useSelector(
    (state: RootState) => state.comicInfo.issuesForVolume,
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getIssuesForSeries(comicObjectId));
    dispatch(getComicBookDetailById(comicObjectId));
  }, []);

  const { comicObjectId } = useParams<{ comicObjectId: string }>();

  const IssuesInVolume = () => (
    <>
      {!isUndefined(issuesForVolume) ? (
        <div className="button" onClick={() => analyzeIssues(issuesForVolume)}>
          Analyze Library
        </div>
      ) : null}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="issues-container"
        columnClassName="issues-column"
      >
        {!isUndefined(issuesForVolume) && !isEmpty(issuesForVolume)
          ? issuesForVolume.map((issue) => {
              return (
                <Card
                  key={issue.id}
                  imageUrl={issue.image.thumb_url}
                  orientation={"vertical"}
                  hasDetails
                  borderColorClass={
                    !isEmpty(issue.matches) ? "green-border" : ""
                  }
                  backgroundColor={!isEmpty(issue.matches) ? "beige" : ""}
                  onClick={() =>
                    openPotentialLibraryMatchesPanel(issue.matches)
                  }
                >
                  <span className="tag is-warning mr-1">{issue.issue_number}</span>
                  {!isEmpty(issue.matches) ? (
                    <>
                      <span className="icon has-text-success">
                        <i className="fa-regular fa-asterisk"></i>
                      </span>
                    </>
                  ) : null}
                </Card>
              );
            })
          : "loading"}
      </Masonry>
    </>
  );

  // Tab content and header details
  const tabGroup = [
    {
      id: 1,
      name: "Issues in Volume",
      icon: <i className="fa-solid fa-layer-group"></i>,
      content: <IssuesInVolume key={1} />,
    },
    {
      id: 2,
      icon: <i className="fa-regular fa-mask"></i>,
      name: "Characters",
      content: <div key={2}>asdasd</div>,
    },
    {
      id: 3,
      icon: <i className="fa-solid fa-scroll"></i>,
      name: "Arcs",
      content: <div key={3}>asdasd</div>,
    },
  ];

  // Tabs
  const MetadataTabGroup = () => {
    return (
      <>
        <div className="tabs">
          <ul>
            {tabGroup.map(({ id, name, icon }) => (
              <li
                key={id}
                className={id === active ? "is-active" : ""}
                onClick={() => setActive(id)}
              >
                <a>
                  <span className="icon is-small">{icon}</span>
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {tabGroup.map(({ id, content }) => {
          return active === id ? content : null;
        })}
      </>
    );
  };

  if (
    !isUndefined(comicBookDetails.sourcedMetadata) &&
    !isUndefined(comicBookDetails.sourcedMetadata.comicvine.volumeInformation)
  ) {
    return (
      <div className="container volume-details">
        <div className="section">
          {/* Title */}
          <h1 className="title">
            {comicBookDetails.sourcedMetadata.comicvine.volumeInformation.name}
          </h1>
          <div className="columns is-multiline">
            {/* Volume cover */}
            <div className="column is-narrow">
              <Card
                imageUrl={
                  comicBookDetails.sourcedMetadata.comicvine.volumeInformation
                    .image.small_url
                }
                cardContainerStyle={{ maxWidth: 275 }}
                orientation={"vertical"}
                hasDetails={false}
              />
            </div>

            <div className="column is-three-fifths">
              <div className="field is-grouped mt-2">
                {/* Comicvine Id */}
                <div className="control">
                  <div className="tags has-addons">
                    <span className="tag">ComicVine Id</span>
                    <span className="tag is-info is-light">
                      {
                        comicBookDetails.sourcedMetadata.comicvine
                          .volumeInformation.id
                      }
                    </span>
                  </div>
                </div>
                {/* Publisher */}
                <div className="control">
                  <div className="tags has-addons">
                    <span className="tag is-warning is-light">Publisher</span>
                    <span className="tag is-volume-related">
                      {
                        comicBookDetails.sourcedMetadata.comicvine
                          .volumeInformation.publisher.name
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Deck */}
              <div>
                {!isEmpty(
                  comicBookDetails.sourcedMetadata.comicvine.volumeInformation
                    .description,
                )
                  ? ellipsize(
                      convert(
                        comicBookDetails.sourcedMetadata.comicvine
                          .volumeInformation.description,
                        {
                          baseElements: {
                            selectors: ["p"],
                          },
                        },
                      ),
                      300,
                    )
                  : null}
              </div>
            </div>

            {/* <pre>{JSON.stringify(issuesForVolume, undefined, 2)}</pre> */}
          </div>
          <MetadataTabGroup />
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
