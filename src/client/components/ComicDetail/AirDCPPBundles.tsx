import React from "react";
import prettyBytes from "pretty-bytes";
import dayjs from "dayjs";
import ellipsize from "ellipsize";
import { map } from "lodash";

export const AirDCPPBundles = (props) => {
  return (
    <div className="overflow-x-auto w-fit mt-4 rounded-lg border border-gray-200">
      <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-200 text-md">
        <thead>
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
              Filename
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
              Size
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
              Download Time
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
              Bundle ID
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {map(props.data, (bundle) => (
            <tr key={bundle.id} className="text-sm">
              <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                <h5>{ellipsize(bundle.name, 58)}</h5>
                <span className="text-xs">{ellipsize(bundle.target, 88)}</span>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                {prettyBytes(bundle.size)}
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                {dayjs
                  .unix(bundle.time_finished)
                  .format("h:mm on ddd, D MMM, YYYY")}
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                <span className="tag is-warning">{bundle.id}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
