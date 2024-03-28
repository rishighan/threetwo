import React, { useEffect, useContext, ReactElement, useState } from "react";
import { RootState } from "threetwo-ui-typings";
import { isEmpty, map } from "lodash";
import { AirDCPPBundles } from "./AirDCPPBundles";
import { TorrentDownloads } from "./TorrentDownloads";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LIBRARY_SERVICE_BASE_URI,
  QBITTORRENT_SERVICE_BASE_URI,
  JOB_QUEUE_SERVICE_BASE_URI,
} from "../../constants/endpoints";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useParams } from "react-router-dom";

interface IDownloadsPanelProps {
  key: number;
}

export const DownloadsPanel = (
  props: IDownloadsPanelProps,
): ReactElement | null => {
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const [bundles, setBundles] = useState([]);
  const [infoHashes, setInfoHashes] = useState<string[]>([]);
  const [torrentDetails, setTorrentDetails] = useState([]);
  const [activeTab, setActiveTab] = useState("torrents");
  const { airDCPPSocketInstance, socketIOInstance } = useStore(
    useShallow((state: any) => ({
      airDCPPSocketInstance: state.airDCPPSocketInstance,
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
  // Fetch the downloaded files and currently-downloading file(s) from AirDC++
  const { data: comicObject, isSuccess } = useQuery({
    queryKey: ["bundles"],
    queryFn: async () =>
      await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookById`,
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        data: {
          id: `${comicObjectId}`,
        },
      }),
  });

  // const {
  //   data: torrentProperties,
  //   isSuccess: torrentPropertiesFetched,
  //   isFetching: torrentPropertiesFetching,
  // } = useQuery({
  //   queryFn: async () =>
  //     await axios({
  //       url: `${QBITTORRENT_SERVICE_BASE_URI}/getTorrentProperties`,
  //       method: "POST",
  //       data: { infoHashes },
  //     }),
  //   queryKey: ["torrentProperties", infoHashes],
  // });

  const getBundles = async (comicObject) => {
    if (comicObject?.data.acquisition.directconnect) {
      const filteredBundles =
        comicObject.data.acquisition.directconnect.downloads.map(
          async ({ bundleId }) => {
            return await airDCPPSocketInstance.get(`queue/bundles/${bundleId}`);
          },
        );
      return await Promise.all(filteredBundles);
    }
  };

  // Call the scheduled job for fetching torrent data
  // triggered by the active tab been set to "torrents"
  const { data: torrentData } = useQuery({
    queryFn: () =>
      axios({
        url: `${JOB_QUEUE_SERVICE_BASE_URI}/getTorrentData`,
        method: "GET",
        params: {
          trigger: activeTab,
        },
      }),
    queryKey: [activeTab],
  });

  useEffect(() => {
    getBundles(comicObject).then((result) => {
      setBundles(result);
    });
  }, [comicObject]);

  return (
    <div className="columns is-multiline">
      {!isEmpty(airDCPPSocketInstance) &&
        !isEmpty(bundles) &&
        activeTab === "directconnect" && <AirDCPPBundles data={bundles} />}

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
                  ? "bg-slate-200 text-slate-800"
                  : "text-slate-200"
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
                  : "text-slate-200"
              }`}
              onClick={() => setActiveTab("torrents")}
            >
              Torrents
            </a>
          </nav>
        </div>
      </div>

      {activeTab === "torrents" && <TorrentDownloads data={torrentDetails} />}
    </div>
  );
};
export default DownloadsPanel;
