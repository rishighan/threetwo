import React, { ReactElement, ReactNode } from "react";
import prettyBytes from "pretty-bytes";
import { isEmpty } from "lodash";
import { format, parseISO, isValid } from "date-fns";
import {
  RawFileDetails as RawFileDetailsType,
  InferredMetadata,
} from "../../graphql/generated";

type RawFileDetailsProps = {
  data?: {
    rawFileDetails?: RawFileDetailsType;
    inferredMetadata?: InferredMetadata;
    createdAt?: string;
  };
  children?: ReactNode;
};

/** Renders raw file info, inferred metadata, and import timestamp for a comic. */
export const RawFileDetails = (props: RawFileDetailsProps): ReactElement => {
  const { rawFileDetails, inferredMetadata, createdAt } = props.data || {};
  return (
    <>
      <div className="max-w-2xl ml-5">
        <div className="px-4 sm:px-6">
          <p className="text-gray-500 dark:text-gray-400">
            <span className="text-xl">{rawFileDetails?.name}</span>
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Raw File Details
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                {rawFileDetails?.containedIn}
                {"/"}
                {rawFileDetails?.name}
                {rawFileDetails?.extension}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Inferred Issue Metadata
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                Series Name: {inferredMetadata?.issue?.name}
                {!isEmpty(inferredMetadata?.issue?.number) ? (
                  <span className="tag is-primary is-light">
                    {inferredMetadata?.issue?.number}
                  </span>
                ) : null}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                MIMEType
              </dt>
              <dd className="mt-1 text-sm text-gray-500 dark:text-slate-900">
                {/* File extension */}
                <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                  <span className="pt-1">
                    <i className="icon-[solar--zip-file-bold-duotone] w-5 h-5"></i>
                  </span>

                  <span className="text-md text-slate-500 dark:text-slate-900">
                    {rawFileDetails?.mimeType}
                  </span>
                </span>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                File Size
              </dt>
              <dd className="mt-1 text-sm text-gray-500 dark:text-slate-900">
                {/* size */}
                <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                  <span className="pr-1 pt-1">
                    <i className="icon-[solar--mirror-right-bold-duotone] w-5 h-5"></i>
                  </span>

                  <span className="text-md text-slate-500 dark:text-slate-900">
                    {rawFileDetails?.fileSize ? prettyBytes(rawFileDetails.fileSize) : "N/A"}
                  </span>
                </span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Import Details
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                {createdAt && isValid(parseISO(createdAt)) ? (
                  <>
                    {format(parseISO(createdAt), "dd MMMM, yyyy")},{" "}
                    {format(parseISO(createdAt), "h aaaa")}
                  </>
                ) : "N/A"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Actions
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{props.children}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
};

export default RawFileDetails;
