import React from "react";
import dayjs from "dayjs";
import prettyBytes from "pretty-bytes";

interface TorrentInfo {
  name: string;
  hash: string;
  added_on: number;
  progress: number;
  downloaded: number;
  uploaded: number;
  trackers_count: number;
  total_size: number;
}

interface TorrentData {
  torrent?: TorrentInfo;
  // Support direct TorrentDetails format from socket events
  infoHash?: string;
  downloadSpeed?: number;
  uploadSpeed?: number;
  name?: string;
}

export interface TorrentDownloadsProps {
  data: TorrentData[];
}

export type { TorrentData };

export const TorrentDownloads = (props: TorrentDownloadsProps) => {
  const { data } = props;
  return (
    <>
      {data.map((item: TorrentData, index: number) => {
        // Support both wrapped format (item.torrent) and direct format
        const torrent: TorrentInfo = item.torrent || {
          name: item.name || 'Unknown',
          hash: item.infoHash || '',
          added_on: 0,
          progress: (item as any).progress || 0,
          downloaded: 0,
          uploaded: 0,
          trackers_count: 0,
          total_size: 0,
        };
        return (
          <dl className="mt-5 dark:text-slate-200 text-slate-600">
            <dt className="text-lg">{torrent.name}</dt>
            <p className="text-sm">{torrent.hash}</p>
            <p className="text-sm">
              Added on {dayjs.unix(torrent.added_on).format("ddd, D MMM, YYYY")}
            </p>

            <p className="flex gap-2 mt-1">
              {torrent.progress > 0 ? (
                <>
                  <progress
                    className="w-80 mt-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-green-400 [&::-moz-progress-bar]:bg-green-400 h-2"
                    value={Math.floor(torrent.progress * 100).toString()}
                    max="100"
                  ></progress>

                  <span>{Math.floor(torrent.progress * 100)}%</span>

                  {/* downloaded/left */}
                  <p className="inline-flex items-center bg-slate-200 text-green-800 dark:text-green-900 text-xs font-medium px-2.5 py-1 rounded-md dark:bg-slate-400">
                    <span className="pr-1">
                      <i className="icon-[solar--arrow-to-down-left-outline] h-4 w-4"></i>
                    </span>
                    <span className="text-md">
                      {prettyBytes(torrent.downloaded)}
                    </span>
                    {/* uploaded */}
                    <span className="pr-1 text-orange-800 dark:text-orange-900 ml-2">
                      <i className="icon-[solar--arrow-to-top-left-outline] h-4 w-4"></i>
                    </span>
                    <span className="text-md text-orange-800 dark:text-orange-900">
                      {prettyBytes(torrent.uploaded)}
                    </span>
                  </p>
                </>
              ) : null}
            </p>
            <div className="flex gap-4 mt-2">
              {/* Peers */}
              <span className="inline-flex items-center bg-slate-200 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                <span className="pr-1">
                  <i className="icon-[solar--station-minimalistic-line-duotone] h-5 w-5"></i>
                </span>
                <span className="text-md text-slate-900">
                  {torrent.trackers_count}
                </span>
              </span>

              {/* Size */}
              <span className="inline-flex items-center bg-slate-200 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                <span className="pr-1 pt-1">
                  <i className="icon-[solar--mirror-right-bold-duotone] h-4 w-4"></i>
                </span>
                <span className="text-md text-slate-900">
                  {prettyBytes(torrent.total_size)}
                </span>
              </span>
            </div>
          </dl>
        );
      })}
    </>
  );
};

export default TorrentDownloads;
