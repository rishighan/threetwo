import React, { useState, ReactElement, useCallback } from "react";
import { useParams } from "react-router-dom";
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
import DownloadsPanel from "./DownloadsPanel";
import { VolumeInformation } from "./Tabs/VolumeInformation";

import { isEmpty, isUndefined, isNil } from "lodash";
import { RootState } from "threetwo-ui-typings";

import "react-sliding-pane/dist/react-sliding-pane.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import SlidingPane from "react-sliding-pane";
import Modal from "react-modal";
import ComicViewer from "react-comic-viewer";

import { extractComicArchive } from "../../actions/fileops.actions";
import { determineCoverFile } from "../../shared/utils/metadata.utils";

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
    },
    userSettings,
  } = data;
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);

  //   const comicVineSearchResults = useSelector(
  //     (state: RootState) => state.comicInfo.searchResults,
  //   );
  //   const comicVineSearchQueryObject = useSelector(
  //     (state: RootState) => state.comicInfo.searchQuery,
  //   );
  //   const comicVineAPICallProgress = useSelector(
  //     (state: RootState) => state.comicInfo.inProgress,
  //   );
  //
  //   const extractedComicBook = useSelector(
  //     (state: RootState) => state.fileOps.extractedComicBookArchive.reading,
  //   );
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
          <div className="card search-criteria-card">
            <div className="card-content">
              <ComicVineSearchForm data={rawFileDetails} />
            </div>
          </div>
          <p className="is-size-5 mt-3 mb-2 ml-3">Searching for:</p>
          {inferredMetadata.issue ? (
            <div className="ml-3">
              <span className="tag mr-3">{inferredMetadata.issue.name} </span>
              <span className="tag"> # {inferredMetadata.issue.number} </span>
            </div>
          ) : null}
          {!comicVineAPICallProgress ? (
            <ComicVineMatchPanel
              props={{
                comicVineSearchQueryObject,
                comicVineAPICallProgress,
                comicVineSearchResults,
                comicObjectId,
              }}
            />
          ) : (
            <div className="progress-indicator-container">
              <div className="indicator">
                <Loader
                  type="MutatingDots"
                  color="#CCC"
                  secondaryColor="#999"
                  height={100}
                  width={100}
                  visible={comicVineAPICallProgress}
                />
              </div>
            </div>
          )}
        </>
      ),
    },

    editComicBookMetadata: {
      content: () => <EditMetadataPanel />,
    },
  };

  // check for the availability of CV metadata
  const isComicBookMetadataAvailable =
    !isUndefined(comicvine) && !isUndefined(comicvine.volumeInformation);

  // check for the availability of rawFileDetails
  const areRawFileDetailsAvailable =
    !isUndefined(rawFileDetails) && !isEmpty(rawFileDetails.cover);

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
      icon: <i className="fa-solid fa-layer-group"></i>,
      content: isComicBookMetadataAvailable ? (
        <VolumeInformation data={data.data} key={1} />
      ) : null,
      shouldShow: isComicBookMetadataAvailable,
    },
    {
      id: 2,
      name: "ComicInfo.xml",
      icon: <i className="fa-solid fa-code"></i>,
      content: (
        <div className="columns" key={2}>
          <div className="column is-three-quarters">
            {!isNil(comicInfo) && <ComicInfoXML json={comicInfo} />}
          </div>
        </div>
      ),
      shouldShow: !isEmpty(comicInfo),
    },
    {
      id: 3,
      icon: <i className="fa-regular fa-file-archive"></i>,
      name: "Archive Operations",
      content: <ArchiveOperations data={data.data} key={3} />,
      shouldShow: areRawFileDetailsAvailable,
    },
    {
      id: 4,
      icon: <i className="fa-solid fa-circle-nodes"></i>,
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
      icon: <i className="fa-solid fa-droplet"></i>,
      name: "Torrent Search",
      content: <>Torrents</>,
      shouldShow: true,
    },
    {
      id: 6,
      icon: null,
      name: !isEmpty(data.data) ? (
        <span className="download-tab-name">Downloads</span>
      ) : (
        "Downloads"
      ),
      content: !isNil(data.data) && !isEmpty(data.data) && (
        <DownloadsPanel
          data={data.data.acquisition.directconnect}
          comicObjectId={comicObjectId}
          key={5}
        />
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
    <section className="container">
      <div className="section">
        {!isNil(data) && !isEmpty(data) && (
          <>
            <h1 className="title">{issueName}</h1>
            <div className="columns is-multiline">
              <div className="column is-narrow">
                <Card
                  imageUrl={url}
                  orientation={"vertical"}
                  hasDetails={false}
                  cardContainerStyle={{ maxWidth: 275 }}
                />
                {/* action dropdown */}
                <div className="mt-4 is-size-7">
                  <Menu
                    data={data.data}
                    handlers={{ setSlidingPanelContentId, setVisible }}
                  />
                </div>
              </div>
              {/* raw file details */}
              <div className="column">
                {!isUndefined(rawFileDetails) &&
                  !isEmpty(rawFileDetails.cover) && (
                    <>
                      <RawFileDetails
                        data={{
                          rawFileDetails: rawFileDetails,
                          inferredMetadata: inferredMetadata,
                        }}
                      />
                      {/* Read comic button */}
                      <button
                        className="button is-success is-light"
                        onClick={() => openModal(rawFileDetails.filePath)}
                      >
                        <i className="fa-solid fa-book-open mr-2"></i>
                        Read
                      </button>

                      <Modal
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
                      </Modal>
                    </>
                  )}
              </div>
            </div>

            {<TabControls filteredTabs={filteredTabs} />}

            <SlidingPane
              isOpen={visible}
              onRequestClose={() => setVisible(false)}
              title={"Comic Vine Search Matches"}
              width={"600px"}
            >
              {slidingPanelContentId !== "" &&
                contentForSlidingPanel[slidingPanelContentId].content()}
            </SlidingPane>
          </>
        )}
      </div>
    </section>
  );
};

export default ComicDetail;
