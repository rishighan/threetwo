import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import prettyBytes from "pretty-bytes";
import { isEmpty } from "lodash";
import { format, parseISO } from "date-fns";

export const RawFileDetails = (props): ReactElement => {
  const { rawFileDetails, inferredMetadata, created_at, updated_at } =
    props.data;
  return (
    <>
      <div className="max-w-2xl ml-5">
        <div className="px-4 sm:px-6">
          <p className="text-gray-500 dark:text-gray-400">
            <span className="text-xl">{rawFileDetails.name}</span>
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Raw File Details
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                {rawFileDetails.containedIn +
                  "/" +
                  rawFileDetails.name +
                  rawFileDetails.extension}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Inferred Issue Metadata
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                Series Name: {inferredMetadata.issue.name}
                {!isEmpty(inferredMetadata.issue.number) ? (
                  <span className="tag is-primary is-light">
                    {inferredMetadata.issue.number}
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
                    {rawFileDetails.mimeType}
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
                    {prettyBytes(rawFileDetails.fileSize)}
                  </span>
                </span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Import Details
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                {format(parseISO(created_at), "dd MMMM, yyyy")},{" "}
                {format(parseISO(created_at), "h aaaa")}
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

RawFileDetails.propTypes = {
  data: PropTypes.shape({
    rawFileDetails: PropTypes.shape({
      containedIn: PropTypes.string,
      name: PropTypes.string,
      fileSize: PropTypes.number,
      path: PropTypes.string,
      extension: PropTypes.string,
      mimeType: PropTypes.string,
      cover: PropTypes.shape({
        filePath: PropTypes.string,
      }),
    }),
    inferredMetadata: PropTypes.shape({
      issue: PropTypes.shape({
        year: PropTypes.string,
        name: PropTypes.string,
        number: PropTypes.number,
        subtitle: PropTypes.string,
      }),
    }),
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }),
  children: PropTypes.any,
};
