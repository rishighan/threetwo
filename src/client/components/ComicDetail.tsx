import React, { useState, useEffect, ReactElement, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Card from "./Carda";
import { ComicVineMatchPanel } from "./ComicDetail/ComicVineMatchPanel";
import { VolumeInformation } from "./ComicDetail/Tabs/VolumeInformation";
import { ComicVineDetails } from "./ComicDetail/ComicVineDetails";
import { RawFileDetails } from "./ComicDetail/RawFileDetails";
import { ArchiveOperations } from "./ComicDetail/Tabs/ArchiveOperations";
import AcquisitionPanel from "./ComicDetail/AcquisitionPanel";
import DownloadsPanel from "./ComicDetail/DownloadsPanel";
import { EditMetadataPanel } from "./ComicDetail/EditMetadataPanel";
import { Menu } from "./ComicDetail/ActionMenu/Menu";

import { isEmpty, isUndefined, isNil } from "lodash";
import { RootState } from "threetwo-ui-typings";

import { getComicBookDetailById } from "../actions/comicinfo.actions";

import "react-sliding-pane/dist/react-sliding-pane.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import SlidingPane from "react-sliding-pane";

import { escapePoundSymbol } from "../shared/utils/formatting.utils";

import { IMPORT_SERVICE_HOST } from "../constants/endpoints";
import { getSettings } from "../actions/settings.actions";
import { AirDCPPSocketContext } from "../context/AirDCPPSocket";
import AirDCPPSocket from "../services/DcppSearchService";

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

export const ComicDetail = ({}: ComicDetailProps): ReactElement => {
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");

  const comicVineSearchResults = useSelector(
    (state: RootState) => state.comicInfo.searchResults,
  );
  const comicVineSearchQueryObject = useSelector(
    (state: RootState) => state.comicInfo.searchQuery,
  );
  const comicVineAPICallProgress = useSelector(
    (state: RootState) => state.comicInfo.inProgress,
  );
  const comicBookDetailData = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const userSettings = useSelector((state: RootState) => state.settings.data);
  const { ADCPPSocket, setADCPPSocket } = useContext(AirDCPPSocketContext);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getComicBookDetailById(comicObjectId));
    dispatch(getSettings());
  }, [page, dispatch]);

  useEffect(() => {
    if (isEmpty(ADCPPSocket) && !isNil(userSettings.directConnect)) {
      setADCPPSocket(
        new AirDCPPSocket({
          protocol: `${userSettings.directConnect.client.host.protocol}`,
          hostname: `${userSettings.directConnect.client.host.hostname}`,
        }),
      );
    }
  }, [userSettings]);

  // sliding panel init
  const contentForSlidingPanel = {
    CVMatches: {
      content: () => {
        if (!comicVineAPICallProgress) {
          return (
            <ComicVineMatchPanel
              props={{
                comicVineSearchQueryObject,
                comicVineAPICallProgress,
                comicVineSearchResults,
                comicObjectId,
              }}
            />
          );
        } else {
          return (
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
          );
        }
      },
    },
    editComicBookMetadata: {
      content: () => <EditMetadataPanel />,
    },
  };

  const [active, setActive] = useState(1);

  const isComicBookMetadataAvailable =
    comicBookDetailData.sourcedMetadata &&
    !isUndefined(comicBookDetailData.sourcedMetadata.comicvine) &&
    !isEmpty(comicBookDetailData.sourcedMetadata);

  // Tab content and header details
  const tabGroup = [
    {
      id: 1,
      name: "Volume Information",
      icon: <i className="fa-solid fa-layer-group"></i>,
      content: isComicBookMetadataAvailable ? (
        <VolumeInformation data={comicBookDetailData} key={1} />
      ) : null,
    },
    {
      id: 2,
      icon: <i className="fa-regular fa-file-archive"></i>,
      name: "Archive Operations",
      content: <ArchiveOperations data={comicBookDetailData} key={2} />,
    },
    {
      id: 3,
      icon: <i className="fa-solid fa-floppy-disk"></i>,
      name: "Acquisition",
      content: (
        <AcquisitionPanel comicBookMetadata={comicBookDetailData} key={3} />
      ),
    },
    {
      id: 4,
      icon: null,
      name:
        !isNil(comicBookDetailData) && !isEmpty(comicBookDetailData) ? (
          <span className="download-tab-name">Downloads</span>
        ) : (
          "Downloads"
        ),
      content: !isNil(comicBookDetailData) && !isEmpty(comicBookDetailData) && (
        <DownloadsPanel
          data={comicBookDetailData.acquisition.directconnect}
          comicObjectId={comicObjectId}
          key={4}
        />
      ),
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
                {/* Downloads tab and count badge */}
                <a>
                  {id === 4 &&
                  !isNil(comicBookDetailData) &&
                  !isEmpty(comicBookDetailData) ? (
                    <span className="download-icon-labels">
                      <i className="fa-solid fa-download"></i>
                      <span className="tag downloads-count">
                        {comicBookDetailData.acquisition.directconnect.length}
                      </span>
                    </span>
                  ) : (
                    <span className="icon is-small">{icon}</span>
                  )}
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

  // Determine which cover image to use:
  // 1. from the locally imported or
  // 2. from the CV-scraped version
  let imagePath = "";
  let comicBookTitle = "";
  if (!isNil(comicBookDetailData.rawFileDetails)) {
    const encodedFilePath = encodeURI(
      `${IMPORT_SERVICE_HOST}/${comicBookDetailData.rawFileDetails.cover.filePath}`,
    );
    imagePath = escapePoundSymbol(encodedFilePath);
    comicBookTitle = comicBookDetailData.rawFileDetails.name;
  } else if (
    !isNil(comicBookDetailData.sourcedMetadata) &&
    !isNil(comicBookDetailData.sourcedMetadata.comicvine)
  ) {
    imagePath = comicBookDetailData.sourcedMetadata.comicvine.image.small_url;
    comicBookTitle = comicBookDetailData.sourcedMetadata.comicvine.name;
  }

  return (
    <section className="container">
      <div className="section">
        {!isNil(comicBookDetailData) && !isEmpty(comicBookDetailData) && (
          <>
            <h1 className="title">{comicBookTitle}</h1>
            <div className="columns is-multiline">
              <div className="column is-narrow">
                <Card
                  imageUrl={imagePath}
                  orientation={"vertical"}
                  hasDetails={false}
                />
              </div>
              {/* raw file details */}
              <div className="column is-three-fifths">
                {!isNil(comicBookDetailData.rawFileDetails) && (
                  <>
                    <RawFileDetails data={comicBookDetailData.rawFileDetails} />
                  </>
                )}
                {/* comic vine scraped metadata */}
                {!isNil(comicBookDetailData.sourcedMetadata.comicvine) && (
                  <ComicVineDetails
                    data={comicBookDetailData.sourcedMetadata.comicvine}
                    updatedAt={comicBookDetailData.updatedAt}
                  />
                )}
              </div>
              {/* action dropdown */}
              <div className="column is-one-fifth is-narrow is-size-7">
                <Menu
                  data={comicBookDetailData}
                  handlers={{ setSlidingPanelContentId, setVisible }}
                />
              </div>
            </div>

            {isComicBookMetadataAvailable ? <MetadataTabGroup /> : null}

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
