import React from "react";
import dayjs from "dayjs";
import prettyBytes from "pretty-bytes";

export const TorrentDownloads = (props) => {
  const { data } = props;
  console.log(Object.values(data));
  return (
    <>
      {data.map(({ torrent }) => {
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
