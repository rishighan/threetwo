import React, { useEffect, useContext, ReactElement, useState } from "react";
import { RootState } from "threetwo-ui-typings";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { AirDCPPBundles } from "./AirDCPPBundles";
import { TorrentDownloads } from "./TorrentDownloads";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LIBRARY_SERVICE_BASE_URI,
  QBITTORRENT_SERVICE_BASE_URI,
  TORRENT_JOB_SERVICE_BASE_URI,
  SOCKET_BASE_URI,
} from "../../constants/endpoints";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useParams } from "react-router";

interface IDownloadsPanelProps {
  key: number;
}

export const DownloadsPanel = (
  props: IDownloadsPanelProps,
): ReactElement | null => {
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const [infoHashes, setInfoHashes] = useState<string[]>([]);
  const [torrentDetails, setTorrentDetails] = useState([]);
  const [activeTab, setActiveTab] = useState("directconnect");
  const { socketIOInstance } = useStore(
    useShallow((state: any) => ({
      socketIOInstance: state.socketIOInstance,
    })),
  );

  // React to torrent progress data sent over websockets
  socketIOInstance.on("AS_TORRENT_DATA", (data) => {
    const torrents = data.torrents
      .flatMap(({ _id, details }) => {
        if (_id === comicObjectId) {
          return details;
        }
      })
      .filter((item) => item !== undefined);
    setTorrentDetails(torrents);
  });

  /**
   * Query to fetch AirDC++ download bundles for a given comic resource Id
   * @param {string} {comicObjectId} - A mongo id that identifies a comic document
   */
  const { data: bundles } = useQuery({
    queryKey: ["bundles"],
    queryFn: async () =>
      await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getBundles`,
        method: "POST",
        data: {
          comicObjectId,
          config: {
            protocol: `ws`,
            hostname: `192.168.1.119:5600`,
            username: `admin`,
            password: `password`,
          },
        },
      }),
    enabled: activeTab !== "" && activeTab === "directconnect",
  });

  // Call the scheduled job for fetching torrent data
  // triggered by the active tab been set to "torrents"
  const { data: torrentData } = useQuery({
    queryFn: () =>
      axios({
        url: `${TORRENT_JOB_SERVICE_BASE_URI}/getTorrentData`,
        method: "GET",
        params: {
          trigger: activeTab,
        },
      }),
    queryKey: [activeTab],
    enabled: activeTab !== "" && activeTab === "torrents",
  });
  console.log(bundles);
  return (
    <div className="columns is-multiline">
      <div>
        <div className="sm:hidden">
          <label htmlFor="Download Type" className="sr-only">
            Download Type
          </label>

          <select id="Tab" className="w-full rounded-md border-gray-200">
            <option>DC++ Downloads</option>
            <option>Torrents</option>
          </select>
        </div>

        <div className="hidden sm:block">
          <nav className="flex gap-6" aria-label="Tabs">
            <a
              href="#"
              className={`shrink-0 rounded-lg p-2 text-sm font-medium hover:bg-gray-50 hover:text-gray-700 ${
                activeTab === "directconnect"
                  ? "bg-slate-200 dark:text-slate-200 dark:bg-slate-400 text-slate-800"
                  : "dark:text-slate-400 text-slate-800"
              }`}
              aria-current="page"
              onClick={() => setActiveTab("directconnect")}
            >
              DC++ Downloads
            </a>

            <a
              href="#"
              className={`shrink-0 rounded-lg p-2 text-sm font-medium hover:bg-gray-50 hover:text-gray-700 ${
                activeTab === "torrents"
                  ? "bg-slate-200 text-slate-800"
                  : "dark:text-slate-400 text-slate-800"
              }`}
              onClick={() => setActiveTab("torrents")}
            >
              Torrents
            </a>
          </nav>
        </div>
      </div>

      {activeTab === "torrents" ? (
        <TorrentDownloads data={torrentDetails} />
      ) : null}
      {!isNil(bundles?.data) && bundles?.data.length !== 0 ? (
        <AirDCPPBundles data={bundles.data} />
      ) : (
        "nutin"
      )}
    </div>
  );
};
export default DownloadsPanel;
