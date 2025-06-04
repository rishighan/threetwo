import React from "react";
import prettyBytes from "pretty-bytes";
import dayjs from "dayjs";
import ellipsize from "ellipsize";
import { map } from "lodash";
import { DownloadProgressTick } from "./DownloadProgressTick";
export const AirDCPPBundles = (props) => {
  return (
    <div className="overflow-x-auto w-fit mt-6">
      <table className="min-w-full text-sm text-gray-900 dark:text-slate-100">
        <thead>
          <tr className="border-b border-gray-300 dark:border-slate-700">
            <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-gray-500 dark:text-slate-400 uppercase">
              Filename
            </th>
            <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-gray-500 dark:text-slate-400 uppercase">
              Size
            </th>
            <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-gray-500 dark:text-slate-400 uppercase">
              Download Status
            </th>
            <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-gray-500 dark:text-slate-400 uppercase">
              Bundle ID
            </th>
          </tr>
        </thead>
        <tbody>
          {map(props.data, (bundle, index) => (
            <tr
              key={bundle.id}
              className={
                Number(index) !== props.data.length - 1
                  ? "border-b border-gray-200 dark:border-slate-700"
                  : ""
              }
            >
              <td className="px-3 py-2 align-top">
                <h5 className="font-medium text-gray-800 dark:text-slate-200">
                  {ellipsize(bundle.name, 58)}
                </h5>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {ellipsize(bundle.target, 88)}
                </p>
              </td>
              <td className="px-3 py-2 align-top">
                {prettyBytes(bundle.size)}
              </td>
              <td className="px-3 py-2 align-top">
                <DownloadProgressTick bundleId={bundle.id} />
              </td>
              <td className="px-3 py-2 align-top">
                <span className="text-xs text-yellow-800 dark:text-yellow-300 font-medium">
                  {bundle.id}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
