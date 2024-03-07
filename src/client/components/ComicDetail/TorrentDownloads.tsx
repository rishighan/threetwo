import React from "react";
import dayjs from "dayjs";
import prettyBytes from "pretty-bytes";

export const TorrentDownloads = (props) => {
  const { data } = props;
  console.log(data);
  return (
    <>
      {data.map((torrent) => {
        return (
          <dl>
            <dt className="text-lg">{torrent.name}</dt>
            <p className="text-sm">{torrent.hash}</p>
            <p className="text-sm">
              Added on{" "}
              {dayjs.unix(torrent.addition_date).format("ddd, D MMM, YYYY")}
            </p>
            <div className="flex gap-4 mt-2">
              {/* Peers */}
              <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                <span className="pr-1 pt-1">
                  <i className="icon-[solar--user-hand-up-bold-duotone] h-4 w-4"></i>
                </span>
                <span className="text-md text-slate-900">
                  {torrent.peers_total}
                </span>
              </span>

              {/* Size */}
              <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
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
