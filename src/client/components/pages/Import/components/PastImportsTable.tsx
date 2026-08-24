/**
 * @fileoverview Table component displaying historical import sessions.
 * @module components/Import/PastImportsTable
 */

import { ReactElement } from "react";
import { format } from "date-fns";
import type { JobResultStatistics } from "./import.types";

/**
 * Props for the PastImportsTable component.
 */
export type PastImportsTableProps = {
  /** Array of job result statistics from past imports */
  data: JobResultStatistics[];
};

/**
 * Displays a table of past import sessions with their statistics.
 *
 * @param props - Component props
 * @returns Table element showing import history
 */
export const PastImportsTable = ({ data }: PastImportsTableProps): ReactElement => {
  return (
    <div className="max-w-screen-lg">
      <span className="flex items-center mt-6">
        <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
          Past Imports
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
      </span>

      <div className="overflow-x-auto w-fit mt-4 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-200 text-md">
          <thead className="ltr:text-left rtl:text-right">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                #
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                Time Started
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                Session Id
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                Imported
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                Failed
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((jobResult, index) => (
              <tr key={jobResult.sessionId || index}>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300 font-medium">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                  {jobResult.earliestTimestamp &&
                  !isNaN(parseInt(jobResult.earliestTimestamp))
                    ? format(
                        new Date(parseInt(jobResult.earliestTimestamp)),
                        "EEEE, hh:mma, do LLLL y"
                      )
                    : "N/A"}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                  <span className="tag is-warning">{jobResult.sessionId}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300">
                  <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                    <span className="h-5 w-6">
                      <i className="icon-[solar--check-circle-line-duotone] h-5 w-5"></i>
                    </span>
                    <p className="whitespace-nowrap text-sm">
                      {jobResult.completedJobs}
                    </p>
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300">
                  <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                    <span className="h-5 w-6">
                      <i className="icon-[solar--close-circle-line-duotone] h-5 w-5"></i>
                    </span>
                    <p className="whitespace-nowrap text-sm">
                      {jobResult.failedJobs}
                    </p>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PastImportsTable;
