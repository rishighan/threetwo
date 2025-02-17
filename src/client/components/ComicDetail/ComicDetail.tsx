import React, { useState, ReactElement, useCallback } from "react";
import { useParams } from "react-router";
import Card from "../shared/Carda";
import { ComicVineMatchPanel } from "./ComicVineMatchPanel";

import { RawFileDetails } from "./RawFileDetails";
import { ComicVineSearchForm } from "./ComicVineSearchForm";

import TabControls from "./TabControls";
import { EditMetadataPanel } from "./EditMetadataPanel";
import { Menu } from "./ActionMenu/Menu";
import { ArchiveOperations } from "./Tabs/ArchiveOperations";
import { ComicInfoXML } from "./Tabs/ComicInfoXML";
import AcquisitionPanel from "./AcquisitionPanel";
import TorrentSearchPanel from "./TorrentSearchPanel";
import DownloadsPanel from "./DownloadsPanel";
import { VolumeInformation } from "./Tabs/VolumeInformation";

import { isEmpty, isUndefined, isNil, filter } from "lodash";
import { components } from "react-select";
import { RootState } from "threetwo-ui-typings";

import "react-sliding-pane/dist/react-sliding-pane.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import SlidingPane from "react-sliding-pane";
import Modal from "react-modal";
import ComicViewer from "react-comic-viewer";

import { extractComicArchive } from "../../actions/fileops.actions";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import axios from "axios";
import { styled } from "styled-components";
import { COMICVINE_SERVICE_URI } from "../../constants/endpoints";
import { refineQuery } from "filename-parser";

type ComicDetailProps = {};
/**
 * Component for displaying the metadata for a comic in greater detail.
 *
 * @component
 * @example
 * return (
 *   <ComicDetail/>
 * )
 */

export const ComicDetail = (data: ComicDetailProps): ReactElement => {
  const {
    data: {
      _id,
      rawFileDetails,
      inferredMetadata,
      sourcedMetadata: { comicvine, locg, comicInfo },
      acquisition,
      createdAt,
      updatedAt,
    },
    userSettings,
  } = data;
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const [comicVineMatches, setComicVineMatches] = useState([]);

  const { comicObjectId } = useParams<{ comicObjectId: string }>();

  // const dispatch = useDispatch();

  const openModal = useCallback((filePath) => {
    setIsOpen(true);
    // dispatch(
    //   extractComicArchive(filePath, {
    //     type: "full",
    //     purpose: "reading",
    //     imageResizeOptions: {
    //       baseWidth: 1024,
    //     },
    //   }),
    // );
  }, []);

  // overridden <SlidingPanel> with some styles
  const StyledSlidingPanel = styled(SlidingPane)`
    background: #ccc;
  `;
  const afterOpenModal = useCallback((things) => {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = "#f00";
    console.log("kolaveri", things);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // sliding panel init
  const contentForSlidingPanel = {
    CVMatches: {
      content: (props) => (
        <>
          <div>
            <ComicVineSearchForm data={rawFileDetails} />
          </div>

          <div className="border-slate-500 border rounded-lg p-2 mt-3">
            <p className="">Searching for:</p>
            {inferredMetadata.issue ? (
              <>
                <span className="">{inferredMetadata.issue.name} </span>
                <span className=""> # {inferredMetadata.issue.number} </span>
              </>
            ) : null}
          </div>
          <ComicVineMatchPanel
            props={{
              comicVineMatches,
              comicObjectId,
            }}
          />
        </>
      ),
    },

    editComicBookMetadata: {
      content: () => <EditMetadataPanel data={rawFileDetails} />,
    },
  };

  // Actions

  const fetchComicVineMatches = async (
    searchPayload,
    issueSearchQuery,
    seriesSearchQuery,
  ) => {
    try {
      const response = await axios({
        url: `${COMICVINE_SERVICE_URI}/volumeBasedSearch`,
        method: "POST",
        data: {
          format: "json",
          // hack
          query: issueSearchQuery.inferredIssueDetails.name
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim(),
          limit: "100",
          page: 1,
          resources: "volume",
          scorerConfiguration: {
            searchParams: issueSearchQuery.inferredIssueDetails,
          },
          rawFileDetails: searchPayload,
        },
        transformResponse: (r) => {
          const matches = JSON.parse(r);
          return matches;
          // return sortBy(matches, (match) => -match.score);
        },
      });
      let matches: any = [];
      if (!isNil(response.data.results) && response.data.results.length === 1) {
        matches = response.data.results;
      } else {
        matches = response.data.map((match) => match);
      }
      const scoredMatches = matches.sort((a, b) => b.score - a.score);
      setComicVineMatches(scoredMatches);
    } catch (err) {
      console.log(err);
    }
  };

  // Action event handlers
  const openDrawerWithCVMatches = () => {
    let seriesSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;
    let issueSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;

    if (!isUndefined(rawFileDetails)) {
      issueSearchQuery = refineQuery(rawFileDetails.name);
    } else if (!isEmpty(comicvine)) {
      issueSearchQuery = refineQuery(comicvine.name);
    }
    fetchComicVineMatches(rawFileDetails, issueSearchQuery, seriesSearchQuery);
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  };

  const openEditMetadataPanel = useCallback(() => {
    setSlidingPanelContentId("editComicBookMetadata");
    setVisible(true);
  }, []);

  //  Actions menu options and handler
  const CVMatchLabel = (
    <span className="inline-flex flex-row items-center gap-2">
      <div className="w-6 h-6">
        <i className="icon-[solar--magic-stick-3-bold-duotone] w-6 h-6"></i>
      </div>
      <div>Match on ComicVine</div>
    </span>
  );
  const editLabel = (
    <span className="inline-flex flex-row items-center gap-2">
      <div className="w-6 h-6">
        <i className="icon-[solar--pen-2-bold-duotone] w-6 h-6"></i>
      </div>
      <div>Edit Metadata</div>
    </span>
  );
  const deleteLabel = (
    <span className="inline-flex flex-row items-center gap-2">
      <div className="w-6 h-6">
        <i className="icon-[solar--trash-bin-trash-bold-duotone] w-6 h-6"></i>
      </div>
      <div>Delete Comic</div>
    </span>
  );
  const Placeholder = (props) => {
    return <components.Placeholder {...props} />;
  };
  const actionOptions = [
    { value: "match-on-comic-vine", label: CVMatchLabel },
    { value: "edit-metdata", label: editLabel },
    { value: "delete-comic", label: deleteLabel },
  ];

  const filteredActionOptions = filter(actionOptions, (item) => {
    if (isUndefined(rawFileDetails)) {
      return item.value !== "match-on-comic-vine";
    }
    return item;
  });
  const handleActionSelection = (action) => {
    switch (action.value) {
      case "match-on-comic-vine":
        openDrawerWithCVMatches();
        break;
      case "edit-metdata":
        openEditMetadataPanel();
        break;
      default:
        console.log("No valid action selected.");
        break;
    }
  };
  const customStyles = {
    menu: (base) => ({
      ...base,
      backgroundColor: "rgb(156, 163, 175)",
    }),
    placeholder: (base) => ({
      ...base,
      color: "black",
    }),
    option: (base, { data, isDisabled, isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? "gray" : "rgb(156, 163, 175)",
    }),
    singleValue: (base) => ({
      ...base,
      paddingTop: "0.4rem",
    }),
    control: (base) => ({
      ...base,
      backgroundColor: "rgb(156, 163, 175)",
      color: "black",
      border: "1px solid rgb(156, 163, 175)",
    }),
  };

  // check for the availability of CV metadata
  const isComicBookMetadataAvailable =
    !isUndefined(comicvine) && !isUndefined(comicvine.volumeInformation);

  // check for the availability of rawFileDetails
  const areRawFileDetailsAvailable =
    !isUndefined(rawFileDetails) && !isEmpty(rawFileDetails);

  const { issueName, url } = determineCoverFile({
    rawFileDetails,
    comicvine,
    locg,
  });

  // query for airdc++
  const airDCPPQuery = {
    issue: {
      name: issueName,
    },
  };

  // Tab content and header details
  const tabGroup = [
    {
      id: 1,
      name: "Volume Information",
      icon: (
        <i className="h-5 w-5 icon-[solar--book-2-bold] text-slate-500 dark:text-slate-300"></i>
      ),
      content: isComicBookMetadataAvailable ? (
        <VolumeInformation data={data.data} key={1} />
      ) : null,
      shouldShow: isComicBookMetadataAvailable,
    },
    {
      id: 2,
      name: "ComicInfo.xml",
      icon: (
        <i className="h-5 w-5 icon-[solar--code-file-bold-duotone] text-slate-500 dark:text-slate-300" />
      ),
      content: (
        <div key={2}>
          {!isNil(comicInfo) && <ComicInfoXML json={comicInfo} />}
        </div>
      ),
      shouldShow: !isEmpty(comicInfo),
    },
    {
      id: 3,
      icon: (
        <i className="h-5 w-5 icon-[solar--winrar-bold-duotone] text-slate-500 dark:text-slate-300" />
      ),
      name: "Archive Operations",
      content: <ArchiveOperations data={data.data} key={3} />,
      shouldShow: areRawFileDetailsAvailable,
    },
    {
      id: 4,
      icon: (
        <i className="h-5 w-5 icon-[solar--folder-path-connect-bold-duotone] text-slate-500 dark:text-slate-300" />
      ),
      name: "DC++ Search",
      content: (
        <AcquisitionPanel
          query={airDCPPQuery}
          comicObjectId={_id}
          comicObject={data.data}
          userSettings={userSettings}
          key={4}
        />
      ),
      shouldShow: true,
    },
    {
      id: 5,
      icon: (
        <span className="inline-flex flex-row">
          <i className="h-5 w-5 icon-[solar--magnet-bold-duotone] text-slate-500 dark:text-slate-300" />
        </span>
      ),
      name: "Torrent Search",
      content: <TorrentSearchPanel comicObjectId={_id} issueName={issueName} />,
      shouldShow: true,
    },
    {
      id: 6,
      name: "Downloads",
      icon: (
        <>
          {acquisition?.directconnect?.downloads?.length +
            acquisition?.torrent.length}
        </>
      ),
      content:
        !isNil(data.data) && !isEmpty(data.data) ? (
          <DownloadsPanel key={5} />
        ) : (
          <div className="column is-three-fifths">
            <article className="message is-info">
              <div className="message-body is-size-6 is-family-secondary">
                AirDC++ is not configured. Please configure it in{" "}
                <code>Settings</code>.
              </div>
            </article>
          </div>
        ),
      shouldShow: true,
    },
  ];
  // filtered Tabs
  const filteredTabs = tabGroup.filter((tab) => tab.shouldShow);

  // Determine which cover image to use:
  // 1. from the locally imported or
  // 2. from the CV-scraped version

  return (
    <section className="container mx-auto">
      <div className="section">
        {!isNil(data) && !isEmpty(data) && (
          <>
            <div>
              <div className="flex flex-row mt-5">
                <Card
                  imageUrl={url}
                  orientation={"cover-only"}
                  hasDetails={false}
                />

                {/* raw file details */}
                {!isUndefined(rawFileDetails) &&
                  !isEmpty(rawFileDetails.cover) && (
                    <div className="grid">
                      <RawFileDetails
                        data={{
                          rawFileDetails: rawFileDetails,
                          inferredMetadata: inferredMetadata,
                          created_at: createdAt,
                          updated_at: updatedAt,
                        }}
                      >
                        {/* action dropdown */}
                        <div className="mt-1 flex flex-row gap-2 w-full">
                          <Menu
                            data={data.data}
                            handlers={{ setSlidingPanelContentId, setVisible }}
                            configuration={{
                              filteredActionOptions,
                              customStyles,
                              handleActionSelection,
                              Placeholder,
                            }}
                          />
                        </div>
                      </RawFileDetails>

                      {/* <Modal
                      style={{ content: { marginTop: "2rem" } }}
                      isOpen={modalIsOpen}
                      onAfterOpen={afterOpenModal}
                      onRequestClose={closeModal}
                      contentLabel="Example Modal"
                    >
                      <button onClick={closeModal}>close</button>
                      {extractedComicBook && (
                        <ComicViewer
                          pages={extractedComicBook}
                          direction="ltr"
                          className={{
                            closeButton: "border: 1px solid red;",
                          }}
                        />
                      )}
                    </Modal> */}
                    </div>
                  )}
              </div>
            </div>

            <TabControls
              filteredTabs={filteredTabs}
              downloadCount={acquisition?.directconnect?.downloads?.length}
            />

            <StyledSlidingPanel
              isOpen={visible}
              onRequestClose={() => setVisible(false)}
              title={"Comic Vine Search Matches"}
              width={"600px"}
            >
              {slidingPanelContentId !== "" &&
                contentForSlidingPanel[slidingPanelContentId].content()}
            </StyledSlidingPanel>
          </>
        )}
      </div>
    </section>
  );
};

export default ComicDetail;
