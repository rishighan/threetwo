import React from "react";
import { isNil, isEmpty } from "lodash";
import { VolumeInformation } from "./Tabs/VolumeInformation";
import { ComicInfoXML } from "./Tabs/ComicInfoXML";
import { ArchiveOperations } from "./Tabs/ArchiveOperations";
import AcquisitionPanel from "./AcquisitionPanel";
import TorrentSearchPanel from "./TorrentSearchPanel";
import DownloadsPanel from "./DownloadsPanel";

interface TabConfig {
  id: number;
  name: string;
  icon: React.ReactElement;
  content: React.ReactElement | null;
  shouldShow: boolean;
}

interface TabConfigParams {
  data: any;
  comicInfo: any;
  isComicBookMetadataAvailable: boolean;
  areRawFileDetailsAvailable: boolean;
  airDCPPQuery: any;
  comicObjectId: string;
  userSettings: any;
  issueName: string;
  acquisition?: any;
}

export const createTabConfig = ({
  data,
  comicInfo,
  isComicBookMetadataAvailable,
  areRawFileDetailsAvailable,
  airDCPPQuery,
  comicObjectId,
  userSettings,
  issueName,
  acquisition,
}: TabConfigParams): TabConfig[] => {
  return [
    {
      id: 1,
      name: "Volume Information",
      icon: (
        <i className="h-5 w-5 icon-[solar--book-2-bold] text-slate-500 dark:text-slate-300"></i>
      ),
      content: isComicBookMetadataAvailable ? (
        <VolumeInformation data={data} key={1} />
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
      content: <ArchiveOperations data={data} key={3} />,
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
          comicObjectId={comicObjectId}
          comicObject={data}
          settings={userSettings}
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
      content: <TorrentSearchPanel comicObjectId={comicObjectId} issueName={issueName} />,
      shouldShow: true,
    },
    {
      id: 6,
      name: "Downloads",
      icon: (
        <>
          {(acquisition?.directconnect?.downloads?.length || 0) +
            (acquisition?.torrent?.length || 0)}
        </>
      ),
      content:
        !isNil(data) && !isEmpty(data) ? (
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
};
