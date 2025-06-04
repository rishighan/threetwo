import prettyBytes from "pretty-bytes";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useStore } from "../../store";
import type { Socket } from "socket.io-client";

/**
 * @typedef {Object} DownloadProgressTickProps
 * @property {string} bundleId    - The bundle ID to filter ticks by (as string)
 */
interface DownloadProgressTickProps {
  bundleId: string;
}

/**
 * Shape of the download tick data received over the socket.
 *
 * @typedef DownloadTickData
 * @property {number} id                 - Unique download ID
 * @property {string} name               - File name (e.g. "movie.mkv")
 * @property {number} downloaded_bytes   - Bytes downloaded so far
 * @property {number} size               - Total size in bytes
 * @property {number} speed              - Current download speed (bytes/sec)
 * @property {number} seconds_left       - Estimated seconds remaining
 * @property {{ id: string; str: string; completed: boolean; downloaded: boolean; failed: boolean; hook_error: any }} status
 *                                           - Status object (e.g. `{ id: "queued", str: "Running (15.1%)", ... }`)
 * @property {{ online: number; total: number; str: string }} sources
 *                                           - Peer count (e.g. `{ online: 1, total: 1, str: "1/1 online" }`)
 * @property {string} target             - Download destination (e.g. "/Downloads/movie.mkv")
 */
interface DownloadTickData {
  id: number;
  name: string;
  downloaded_bytes: number;
  size: number;
  speed: number;
  seconds_left: number;
  status: {
    id: string;
    str: string;
    completed: boolean;
    downloaded: boolean;
    failed: boolean;
    hook_error: any;
  };
  sources: {
    online: number;
    total: number;
    str: string;
  };
  target: string;
}

export const DownloadProgressTick: React.FC<DownloadProgressTickProps> = ({
  bundleId,
}): ReactElement | null => {
  const socketRef = useRef<Socket>();
  const [tick, setTick] = useState<DownloadTickData | null>(null);
  useEffect(() => {
    const socket = useStore.getState().getSocket("manual");
    socketRef.current = socket;

    socket.emit("call", "socket.listenFileProgress", {
      namespace: "/manual",
      config: {
        protocol: `ws`,
        hostname: `192.168.1.119:5600`,
        username: `admin`,
        password: `password`,
      },
    });

    /**
     * Handler for each "downloadTick" event.
     * Only update state if event.id matches bundleId.
     *
     * @param {DownloadTickData} data - Payload from the server
     */
    const onDownloadTick = (data: DownloadTickData) => {
      // Compare numeric data.id to string bundleId
      console.log(data.id);
      console.log(`bundleId is ${bundleId}`)
      if (data.id === parseInt(bundleId, 10)) {
        setTick(data);
      }
    };

    socket.on("downloadTick", onDownloadTick);
    return () => {
      socket.off("downloadTick", onDownloadTick);
    };
  }, [socketRef, bundleId]);

  if (!tick) {
    return <>Nothing detected.</>;
  }

  // Compute human-readable values and percentages
  const downloaded = prettyBytes(tick.downloaded_bytes);
  const total = prettyBytes(tick.size);
  const percent = tick.size > 0
    ? Math.round((tick.downloaded_bytes / tick.size) * 100)
    : 0;
  const speed = prettyBytes(tick.speed) + "/s";
  const minutesLeft = Math.round(tick.seconds_left / 60);

  return (
    <div className="mt-2 p-2 border rounded-md bg-white shadow-sm">
      {/* Downloaded vs Total */}
      <div className="mt-1 flex items-center space-x-2">
        <span className="text-sm text-gray-700">{downloaded} of {total}</span>
      </div>

      {/* Progress bar */}
      <div className="relative mt-2 h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-green-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-600">{percent}% complete</div>

      {/* Speed and Time Left */}
      <div className="mt-2 flex space-x-4 text-xs text-gray-600">
        <span>Speed: {speed}</span>
        <span>Time left: {minutesLeft} min</span>
      </div>
    </div>
  );
};

export default DownloadProgressTick;
