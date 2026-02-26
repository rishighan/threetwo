import { isUndefined } from "lodash";
import React, { ReactElement } from "react";

export const ComicInfoXML = (data: { json: any }): ReactElement => {
  const { json } = data;
  return (
    <div className="flex w-3/4">
      <dl className="dark:bg-yellow-600 bg-yellow-200 p-3 rounded-lg w-full">
        <dt>
          <p className="text-lg">{json.series?.[0]}</p>
        </dt>
        <dd className="text-sm">
          published by{" "}
          <span className="underline">
            {json.publisher?.[0]}
            <i className="icon-[solar--arrow-right-up-outline] w-4 h-4" />
          </span>
        </dd>
        <span className="inline-flex flex-row gap-2">
          {/* Issue number */}
          {!isUndefined(json.number) && (
            <dd className="my-2">
              <span className="inline-flex items-center bg-slate-50 text-sm text-slate-800 font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                <span className="pr-1 pt-1">
                  <i className="icon-[solar--hashtag-outline] w-4 h-4"></i>
                </span>
                <span className="text-slate-900 dark:text-slate-900">
                  {parseInt(json.number[0], 10)}
                </span>
              </span>
            </dd>
          )}
          {/* Genre */}
          {!isUndefined(json.genre) && (
            <dd className="my-2">
              <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                <span className="pr-1 pt-1">
                  <i className="icon-[solar--sticker-smile-circle-bold-duotone] w-5 h-5"></i>
                </span>

                <span className="text-slate-500 dark:text-slate-900">
                  {json.genre[0]}
                </span>
              </span>
            </dd>
          )}
        </span>

        <dd className="my-1">
          {/* Summary */}
          {!isUndefined(json.summary) && (
            <span className="text-md text-slate-500 dark:text-slate-900">
              {json.summary[0]}
            </span>
          )}
        </dd>
        {!isUndefined(json.notes) && (
          <dd>
            {/* Notes */}
            <span className="text-sm text-slate-500 dark:text-slate-900">
              {json.notes[0]}
            </span>
          </dd>
        )}
      </dl>
    </div>
  );
};

export default ComicInfoXML;
