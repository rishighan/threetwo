import React, { ReactElement, useEffect, useState } from "react";
import { isEmpty, isNil, isUndefined } from "lodash";
import { useSelector } from "react-redux";
import { ArchiveOperations } from "../ComicDetail/Tabs/ArchiveOperations";
import { ComicInfoXML } from "../ComicDetail/Tabs/ComicInfoXML";
import AcquisitionPanel from "../ComicDetail/AcquisitionPanel";
import DownloadsPanel from "../ComicDetail/DownloadsPanel";
import { VolumeInformation } from "../ComicDetail/Tabs/VolumeInformation";

export const TabControls = (props): ReactElement => {
  const comicBookDetailData = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );

  const libraryServiceCallInProgress = useSelector(
    (state: RootState) => state.fileOps.IMSCallInProgress,
  );
  const { comicObjectId } = props;

  // check for the availability of CV metadata
  const isComicBookMetadataAvailable =
    comicBookDetailData.sourcedMetadata &&
    !isUndefined(comicBookDetailData.sourcedMetadata.comicvine) &&
    !isUndefined(
      comicBookDetailData.sourcedMetadata.comicvine.volumeInformation,
    ) &&
    !isEmpty(comicBookDetailData.sourcedMetadata);

  // check for the availability of rawFileDetails
  const areRawFileDetailsAvailable =
    !isUndefined(comicBookDetailData.rawFileDetails) &&
    !isEmpty(comicBookDetailData.rawFileDetails.cover);

  // query for airdc++
  const airDCPPQuery = {};
  if (isComicBookMetadataAvailable) {
    Object.assign(airDCPPQuery, {
      issue: {
        name: comicBookDetailData.sourcedMetadata.comicvine.volumeInformation
          .name,
      },
    });
  } else if (areRawFileDetailsAvailable) {
    Object.assign(airDCPPQuery, {
      issue: {
        name: comicBookDetailData.inferredMetadata.issue.name,
        number: comicBookDetailData.inferredMetadata.issue.number,
      },
    });
  }
  // Tab content and header details
  const tabGroup = [
    {
      id: 1,
      name: "Volume Information",
      icon: <i className="fa-solid fa-layer-group"></i>,
      content: isComicBookMetadataAvailable ? (
        <VolumeInformation data={comicBookDetailData} key={1} />
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
            {!isNil(comicBookDetailData.sourcedMetadata) &&
              !isNil(comicBookDetailData.sourcedMetadata.comicInfo) && (
                <ComicInfoXML
                  json={comicBookDetailData.sourcedMetadata.comicInfo}
                />
              )}
          </div>
        </div>
      ),
      shouldShow:
        !isUndefined(comicBookDetailData.sourcedMetadata) &&
        !isEmpty(comicBookDetailData.sourcedMetadata.comicInfo),
    },
    {
      id: 3,
      icon: <i className="fa-regular fa-file-archive"></i>,
      name: "Archive Operations",
      content: <ArchiveOperations data={comicBookDetailData} key={3} />,
      shouldShow: areRawFileDetailsAvailable,
    },
    {
      id: 4,
      icon: <i className="fa-solid fa-floppy-disk"></i>,
      name: "Acquisition",
      content: (
        <AcquisitionPanel
          query={airDCPPQuery}
          comicObjectid={comicBookDetailData._id}
          key={4}
        />
      ),
      shouldShow: true,
    },
    {
      id: 5,
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
          key={5}
        />
      ),
      shouldShow: true,
    },
  ];
  // filtered Tabs
  const filteredTabs = tabGroup.filter((tab) => tab.shouldShow);

  const [active, setActive] = useState(filteredTabs[0].id);

  return !libraryServiceCallInProgress ? (
    <>
      <div className="tabs">
        <ul>
          {filteredTabs.map(({ id, name, icon }) => (
            <li
              key={id}
              className={id === active ? "is-active" : ""}
              onClick={() => setActive(id)}
            >
              {/* Downloads tab and count badge */}
              <a>
                {id === 5 &&
                !isNil(comicBookDetailData) &&
                !isEmpty(comicBookDetailData) ? (
                  <span className="download-icon-labels">
                    <i className="fa-solid fa-download"></i>
                    <span className="tag downloads-count is-info is-light">
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
      {filteredTabs.map(({ id, content }) => {
        return active === id ? content : null;
      })}
    </>
  ) : (
    <>ANNA</>
  );
};

export default TabControls;
