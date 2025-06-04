import React, { useEffect, ReactElement, useState, useMemo } from "react";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { AirDCPPBundles } from "./AirDCPPBundles";
import { TorrentDownloads } from "./TorrentDownloads";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LIBRARY_SERVICE_BASE_URI,
  QBITTORRENT_SERVICE_BASE_URI,
  TORRENT_JOB_SERVICE_BASE_URI,
} from "../../constants/endpoints";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useParams } from "react-router-dom";

export interface TorrentDetails {
  infoHash: string;
  progress: number;
  downloadSpeed?: number;
  uploadSpeed?: number;
}

/**
 * DownloadsPanel displays two tabs of download information for a specific comic:
 * - DC++ (AirDCPP) bundles
 * - Torrent downloads
 * It also listens for real-time torrent updates via a WebSocket.
 *
 * @component
 * @returns {ReactElement | null} The rendered DownloadsPanel or null if no socket is available.
 */
export const DownloadsPanel = (): ReactElement | null => {
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const [infoHashes, setInfoHashes] = useState<string[]>([]);
  const [torrentDetails, setTorrentDetails] = useState<TorrentDetails[]>([]);
  const [activeTab, setActiveTab] = useState<"directconnect" | "torrents">(
    "directconnect",
  );

  const { socketIOInstance } = useStore(
    useShallow((state: any) => ({ socketIOInstance: state.socketIOInstance })),
  );

  /**
   * Registers socket listeners on mount and cleans up on unmount.
   */
  useEffect(() => {
    if (!socketIOInstance) return;

    /**
     * Handler for incoming torrent data events.
     * Merges new entries or updates existing ones by infoHash.
     *
     * @param {TorrentDetails} data - Payload from the socket event.
     */
    const handleTorrentData = (data: TorrentDetails) => {
      setTorrentDetails((prev) => {
        const idx = prev.findIndex((t) => t.infoHash === data.infoHash);
        if (idx === -1) {
          return [...prev, data];
        }
        const next = [...prev];
        next[idx] = { ...next[idx], ...data };
        return next;
      });
    };

    socketIOInstance.on("AS_TORRENT_DATA", handleTorrentData);

    return () => {
      socketIOInstance.off("AS_TORRENT_DATA", handleTorrentData);
    };
  }, [socketIOInstance]);

  // ————— DC++ Bundles (via REST) —————
  const { data: bundles } = useQuery({
    queryKey: ["bundles", comicObjectId],
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
  });

  // ————— Torrent Jobs (via REST) —————
  const { data: rawJobs = [] } = useQuery<any[]>({
    queryKey: ["torrents", comicObjectId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${TORRENT_JOB_SERVICE_BASE_URI}/getTorrentData`,
        { params: { trigger: activeTab } },
      );
      return Array.isArray(data) ? data : [];
    },
    initialData: [],
    enabled: activeTab === "torrents",
  });

  // Only when rawJobs changes *and* activeTab === "torrents" should we update infoHashes:
  useEffect(() => {
    if (activeTab !== "torrents") return;
    setInfoHashes(rawJobs.map((j: any) => j.infoHash));
  }, [activeTab]);

  return (
    <>
      <div className="mt-5 mb-3">
        <nav className="flex space-x-2">
          <button
            onClick={() => setActiveTab("directconnect")}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === "directconnect"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            DC++
          </button>
          <button
            onClick={() => setActiveTab("torrents")}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === "torrents"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Torrents
          </button>
        </nav>

        <div className="mt-4">
          {activeTab === "torrents" ? (
            <TorrentDownloads data={torrentDetails} />
          ) : !isNil(bundles?.data) && bundles.data.length > 0 ? (
            <AirDCPPBundles data={bundles.data} />
          ) : (
            <p>No DC++ bundles found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DownloadsPanel;
