import { isEmpty, isUndefined, map, partialRight, pick } from "lodash";
import React, { useEffect, ReactElement, useState, useCallback } from "react";
import { useParams } from "react-router";
import {
  getComicBookDetailById,
  getIssuesForSeries,
  analyzeLibrary,
} from "../../actions/comicinfo.actions";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import PotentialLibraryMatches from "./PotentialLibraryMatches";
import { Card } from "../shared/Carda";
import SlidingPane from "react-sliding-pane";
import { convert } from "html-to-text";
import ellipsize from "ellipsize";
import {
  COMICVINE_SERVICE_URI,
  LIBRARY_SERVICE_BASE_URI,
} from "../../constants/endpoints";
import axios from "axios";

const VolumeDetails = (props): ReactElement => {
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
        {
          /* return <PotentialLibraryMatches matches={matchIds} />; */
        }
      },
    },
  };

  // sliding panel handlers
  const openPotentialLibraryMatchesPanel = useCallback((potentialMatches) => {
    setSlidingPanelContentId("potentialMatchesInLibrary");
    setMatches(potentialMatches);
    setVisible(true);
  }, []);

  //   const analyzeIssues = useCallback((issues) => {
  //     dispatch(analyzeLibrary(issues));
  //   }, []);
  //
  //   const comicObject = useSelector(
  //     (state: RootState) => state.comicInfo.comicBookDetail,
  //   );

  useEffect(() => {
    // dispatch(getIssuesForSeries(comicObjectId));
    // dispatch(getComicBookDetailById(comicObjectId));
  }, []);

  const { comicObjectId } = useParams<{ comicObjectId: string }>();

  const { data: comicObject, isSuccess: isComicObjectFetchedSuccessfully } =
    useQuery({
      queryFn: async () =>
        axios({
          url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookById`,
          method: "POST",
          data: {
            id: comicObjectId,
          },
        }),
      queryKey: ["comicObject"],
    });

  // get issues for a series
  const {
    data: issuesForSeries,
    isSuccess,
    isFetching,
  } = useQuery({
    queryFn: async () =>
      await axios({
        url: `${COMICVINE_SERVICE_URI}/getIssuesForSeries`,
        method: "POST",
        data: {
          comicObjectId,
        },
      }),
    queryKey: ["issuesForSeries"],
    enabled: false,
  });

  console.log("jihya", issuesForSeries);
  const IssuesInVolume = () => (
    <>
      {!isUndefined(issuesForSeries) ? (
        <div className="button" onClick={() => analyzeIssues(issuesForSeries)}>
          Analyze Library
        </div>
      ) : null}
      <>
        {isSuccess &&
          issuesForSeries.data.map((issue) => {
            return (
              <>
                <Card
                  key={issue.id}
                  imageUrl={issue.image.small_url}
                  orientation={"cover-only"}
                  hasDetails={false}
                />
                <span className="tag is-warning mr-1">
                  {issue.issue_number}
                </span>
                {!isEmpty(issue.matches) ? (
                  <>
                    <span className="icon has-text-success">
                      <i className="fa-regular fa-asterisk"></i>
                    </span>
                  </>
                ) : null}
              </>
            );
          })}
      </>
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
      content: <div key={2}>Characters</div>,
    },
    {
      id: 3,
      icon: <i className="fa-solid fa-scroll"></i>,
      name: "Story Arcs",
      content: <div key={3}>Story Arcs</div>,
    },
  ];

  // Tabs
  const MetadataTabGroup = () => {
    return (
      <>
        <div className="hidden sm:block mt-7 mb-3 w-fit">
          <div className="border-b border-gray-200">
            <nav className="flex gap-6" aria-label="Tabs">
              {tabGroup.map(({ id, name, icon }) => (
                <a
                  key={id}
                  className={`inline-flex shrink-0 items-center gap-2 px-1 py-1 text-md font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:border-b hover:dark:text-slate-200 ${
                    active === id
                      ? "border-b border-cyan-50 dark:text-slate-200"
                      : "border-b border-transparent"
                  }`}
                  aria-current="page"
                  onClick={() => setActive(id)}
                >
                  <span className="w-5 h-5">{icon}</span>
                  {name}
                </a>
              ))}
            </nav>
          </div>
        </div>
        {tabGroup.map(({ id, content }) => {
          return active === id ? content : null;
        })}
      </>
    );
  };
  if (isComicObjectFetchedSuccessfully && !isUndefined(comicObject.data)) {
    const { sourcedMetadata } = comicObject.data;
    return (
      <div className="container mx-auto">
        <div>
          <div className="flex flex-row gap-4">
            {/* Volume cover */}
            <Card
              imageUrl={
                sourcedMetadata.comicvine.volumeInformation.image.small_url
              }
              orientation={"cover-only"}
              hasDetails={false}
            />

            <div>
              <div className="field is-grouped mt-2">
                {/* Title */}
                <span className="text-xl">
                  {sourcedMetadata.comicvine.volumeInformation.name}
                </span>
                {/* Comicvine Id */}
                <div className="control">
                  <div className="tags has-addons">
                    <span className="tag">ComicVine Id</span>
                    <span className="tag is-info is-light">
                      {sourcedMetadata.comicvine.volumeInformation.id}
                    </span>
                  </div>
                </div>
                {/* Publisher */}
                <div className="control">
                  <div className="tags has-addons">
                    <span className="tag is-warning is-light">Publisher</span>
                    <span className="tag is-volume-related">
                      {
                        sourcedMetadata.comicvine.volumeInformation.publisher
                          .name
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Deck */}
              <div>
                {!isEmpty(
                  sourcedMetadata.comicvine.volumeInformation.description,
                )
                  ? ellipsize(
                      convert(
                        sourcedMetadata.comicvine.volumeInformation.description,
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
