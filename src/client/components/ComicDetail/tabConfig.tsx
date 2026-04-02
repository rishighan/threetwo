import React, { lazy } from "react";
import { isNil, isEmpty } from "lodash";

const VolumeInformation = lazy(() => import("./Tabs/VolumeInformation").then(m => ({ default: m.VolumeInformation })));
const ArchiveOperations = lazy(() => import("./Tabs/ArchiveOperations").then(m => ({ default: m.ArchiveOperations })));
const AcquisitionPanel = lazy(() => import("./AcquisitionPanel"));
const TorrentSearchPanel = lazy(() => import("./TorrentSearchPanel"));
const DownloadsPanel = lazy(() => import("./DownloadsPanel"));

interface TabConfig {
  id: number;
  name: string;
  icon: React.ReactElement;
  content: React.ReactElement | null;
  shouldShow: boolean;
}

interface TabConfigParams {
  data: any;
  hasAnyMetadata: boolean;
  areRawFileDetailsAvailable: boolean;
  airDCPPQuery: any;
  comicObjectId: string;
  userSettings: any;
  issueName: string;
  acquisition?: any;
  onReconcileMetadata?: () => void;
}

export const createTabConfig = ({
  data,
  hasAnyMetadata,
  areRawFileDetailsAvailable,
  airDCPPQuery,
  comicObjectId,
  userSettings,
  issueName,
  acquisition,
  onReconcileMetadata,
}: TabConfigParams): TabConfig[] => {
  return [
    {
      id: 1,
      name: "Volume Information",
      icon: (
        <i className="h-5 w-5 icon-[solar--book-2-bold] text-slate-500 dark:text-slate-300"></i>
      ),
      content: hasAnyMetadata ? (
        <VolumeInformation data={data} onReconcile={onReconcileMetadata} key={1} />
      ) : null,
      shouldShow: hasAnyMetadata,
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
