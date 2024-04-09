import { isEmpty, isNil, isUndefined, map, partialRight, pick } from "lodash";
import React, { ReactElement, useState, useCallback } from "react";
import { useParams } from "react-router";
import { analyzeLibrary } from "../../actions/comicinfo.actions";
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
  const [storyArcsData, setStoryArcsData] = useState([]);
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
        url: `${COMICVINE_SERVICE_URI}/getIssuesForVolume`,
        method: "POST",
        data: {
          volumeId:
            comicObject?.data?.sourcedMetadata.comicvine.volumeInformation.id,
        },
      }),
    queryKey: ["issuesForSeries", comicObject?.data],
    enabled: !isUndefined(comicObject?.data),
  });
  // get story arcs
  const useGetStoryArcs = () => {
    return useMutation({
      mutationFn: async (comicObject) =>
        axios({
          url: `${COMICVINE_SERVICE_URI}/getResource`,
          method: "POST",
          data: {
            comicObject,
            resource: "issue",
            filter: `id:${comicObject?.sourcedMetadata.comicvine.id}`,
          },
        }),
      onSuccess: (data) => {
        setStoryArcsData(data?.data.results);
      },
    });
  };

  const {
    mutate: getStoryArcs,
    isIdle,
    isError,
    data,
    error,
    status,
  } = useGetStoryArcs();

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

  const Issues = () => (
    <>
      <article
        role="alert"
        className="mt-4 rounded-lg text-sm max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
      >
        <div>
          You can add a single issue or the whole volume, and it will be added
          to the list of `Wanted` items.
        </div>
      </article>
      <div className="flex flex-wrap">
        {isSuccess &&
          issuesForSeries?.data.map((issue) => {
            return (
              <div className="my-3 dark:bg-slate-400 bg-slate-300 p-4 rounded-lg w-3/4">
                <div className="flex flex-row gap-4 mb-2">
                  <div className="w-fit">
                    <img
                      src={issue.image.thumb_url}
                      className="w-full rounded-md"
                    />
                  </div>
                  <div className="w-3/4">
                    <p className="text-xl">{issue.name}</p>
                    <p className="text-sm">
                      {convert(issue.description, {
                        baseElements: {
                          selectors: ["p"],
                        },
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );

  // Tab content and header details
  const tabGroup = [
    {
      id: 1,
      name: "Issues in Volume",
      icon: <i className="icon-[solar--documents-bold-duotone] w-6 h-6"></i>,
      content: <Issues />,
    },
    {
      id: 2,
      icon: (
        <i className="icon-[solar--users-group-rounded-bold-duotone] w-6 h-6"></i>
      ),
      name: "Characters",
      content: <div key={2}>Characters</div>,
    },
    {
      id: 3,
      icon: (
        <i className="icon-[solar--book-bookmark-bold-duotone] w-6 h-6"></i>
      ),
      name: "Story Arcs",
      content: (
        <div key={3}>
          <button className="" onClick={() => getStoryArcs(comicObject?.data)}>
            Get story arcs
          </button>
          {status === "pending" && <>{status}</>}
          {!isEmpty(storyArcsData) && status === "success" && (
            <>
              <ul>
                {storyArcsData.map((storyArc) => {
                  return (
                    <li>
                      <span className="text-lg">{storyArc?.name}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      ),
    },
  ];

  // Tabs
  const MetadataTabGroup = () => {
    return (
      <>
        <div className="hidden sm:block mt-7 mb-3 w-fit">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4" aria-label="Tabs">
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
                  <span className="pt-1">{icon}</span>
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
      <>
        <header className="bg-slate-200 dark:bg-slate-500">
          <div className="mx-auto max-w-screen-xl px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Volumes
                </h1>

                <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                  Browse your collection of volumes.
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto mt-4">
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
                <div className="field is-grouped">
                  {/* Title */}
                  <span className="text-2xl">
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
                          sourcedMetadata.comicvine.volumeInformation
                            .description,
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
      </>
    );
  } else {
    return <></>;
  }
};

export default VolumeDetails;
