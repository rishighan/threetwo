import React, { ReactElement } from "react";
import prettyBytes from "pretty-bytes";
import { isEmpty } from "lodash";
import { format, parseISO } from "date-fns";

interface RawFileDetailsProps {
  data?: {
    rawFileDetails?: {
      containedIn?: string;
      name?: string;
      fileSize?: number;
      path?: string;
      extension?: string;
      mimeType?: string;
      cover?: {
        filePath?: string;
      };
    };
    inferredMetadata?: {
      issue?: {
        year?: string;
        name?: string;
        number?: number;
        subtitle?: string;
      };
    };
    created_at?: string;
    updated_at?: string;
  };
  children?: any;
}

export const RawFileDetails = (props: RawFileDetailsProps): ReactElement | null => {
  const { rawFileDetails, inferredMetadata, created_at, updated_at } =
    props.data || {};
  if (!rawFileDetails) return null;

  return (
    <>
      <div className="max-w-2xl ml-5">
        {/* Title */}
        <div className="px-4 sm:px-6 mb-6">
          <p className="text-gray-500 dark:text-gray-400">
            <span className="text-xl font-semibold">{rawFileDetails?.name}</span>
          </p>
        </div>

        {/* File Binary Details Section */}
        <div className="mb-8 px-4 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1">
              <i className="icon-[solar--document-bold-duotone] w-5 h-5"></i>
              File Binary Details
            </h3>
          </div>
          <div className="pl-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
                  File Path
                </dt>
                <dd className="text-sm text-gray-900 dark:text-gray-300 font-mono break-all">
                  {rawFileDetails?.containedIn}/{rawFileDetails?.name}{rawFileDetails?.extension}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
                    MIME Type
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <i className="icon-[solar--zip-file-bold-duotone] w-5 h-5"></i>
                    {rawFileDetails?.mimeType}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
                    File Size
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <i className="icon-[solar--mirror-right-bold-duotone] w-5 h-5"></i>
                    {rawFileDetails?.fileSize ? prettyBytes(rawFileDetails.fileSize) : 'N/A'}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* Import Details Section */}
        <div className="mb-8 px-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1">
              <i className="icon-[solar--import-bold-duotone] w-5 h-5"></i>
              Import Details
            </h3>
          </div>
          <div className="pl-6">
            <dl className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
                    Imported On
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300">
                    {created_at ? format(parseISO(created_at), "dd MMMM, yyyy 'at' h:mm aaaa") : 'N/A'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
                    Last Updated
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300">
                    {updated_at ? format(parseISO(updated_at), "dd MMMM, yyyy 'at' h:mm aaaa") : 'N/A'}
                  </dd>
                </div>
              </div>

              {inferredMetadata?.issue && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-1">
                    Inferred Metadata
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{inferredMetadata.issue.name}</span>
                    {!isEmpty(inferredMetadata.issue.number) && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        #{inferredMetadata.issue.number}
                      </span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Actions Section */}
        {props.children && (
          <div className="px-4">
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                Actions
              </h4>
            </div>
            <div>{props.children}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default RawFileDetails;
