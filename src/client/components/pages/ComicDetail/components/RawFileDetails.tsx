import React, { ReactElement, ReactNode } from "react";
import prettyBytes from "pretty-bytes";
import { isEmpty } from "lodash";
import { format, parseISO, isValid } from "date-fns";
import {
  RawFileDetails as RawFileDetailsType,
  InferredMetadata,
} from "../../../../graphql/generated";

/**
 * Props for the RawFileDetails component.
 *
 * @typedef {Object} RawFileDetailsProps
 * @property {Object} [data] - Container object for comic book file and metadata information
 * @property {RawFileDetailsType} [data.rawFileDetails] - Raw file details extracted from comic archive including file path, size, and MIME type
 * @property {InferredMetadata} [data.inferredMetadata] - Metadata inferred from filename parsing including series name and issue number
 * @property {string} [data.createdAt] - ISO timestamp string indicating when the comic was imported into the system
 * @property {ReactNode} [children] - Child components to render in the Actions section, typically action buttons or dropdown menus
 */
type RawFileDetailsProps = {
  data?: {
    rawFileDetails?: RawFileDetailsType;
    inferredMetadata?: InferredMetadata;
    createdAt?: string;
  };
  children?: ReactNode;
};

/**
 * Displays comprehensive raw file information, inferred metadata, and import details for a comic book.
 *
 * This component renders detailed information about a comic book file including:
 * - Raw file details (name, path, MIME type, file size)
 * - Inferred metadata from filename parsing (series name, issue number)
 * - Import timestamp with formatted date display
 * - Action section for child components (buttons, dropdowns, etc.)
 *
 * The component uses a responsive grid layout and provides proper fallbacks for missing data.
 * File sizes are displayed in human-readable format using the pretty-bytes library.
 * Dates are formatted using date-fns for consistent display across locales.
 *
 * @param {RawFileDetailsProps} props - Component props containing comic data and children
 * @param {Object} [props.data] - Container object with comic file and metadata information
 * @param {RawFileDetailsType} [props.data.rawFileDetails] - Raw file details including path, size, MIME type
 * @param {InferredMetadata} [props.data.inferredMetadata] - Metadata inferred from filename parsing
 * @param {string} [props.data.createdAt] - ISO timestamp when comic was imported
 * @param {ReactNode} [props.children] - Child components rendered in the Actions section
 *
 * @returns {ReactElement} The rendered raw file details display with metadata and actions
 *
 * @example
 * ```tsx
 * <RawFileDetails
 *   data={{
 *     rawFileDetails: {
 *       name: "Batman_001",
 *       extension: ".cbz",
 *       containedIn: "/comics/batman/",
 *       mimeType: "application/zip",
 *       fileSize: 25600000
 *     },
 *     inferredMetadata: {
 *       issue: {
 *         name: "Batman",
 *         number: "001"
 *       }
 *     },
 *     createdAt: "2023-10-15T10:30:00Z"
 *   }}
 * >
 *   <ActionButton onClick={handleEdit}>Edit</ActionButton>
 * </RawFileDetails>
 * ```
 */
export const RawFileDetails = (props: RawFileDetailsProps): ReactElement => {
  /**
   * Destructures the data object from props, extracting raw file details,
   * inferred metadata, and creation timestamp with safe defaults.
   */
  const { rawFileDetails, inferredMetadata, createdAt } = props.data || {};

  return (
    <>
      <div className="max-w-2xl ml-5">
        {/* Header section displaying the comic file name */}
        <div className="px-4 sm:px-6">
          <p className="text-gray-500 dark:text-gray-400">
            <span className="text-xl">{rawFileDetails?.name}</span>
          </p>
        </div>

        {/* Main content grid displaying file details, metadata, and actions */}
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">

            {/* Raw file path and filename display */}
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

            {/* Inferred metadata from filename parsing */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Inferred Issue Metadata
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                Series Name: {inferredMetadata?.issue?.name}
                {/* Conditionally render issue number if available */}
                {!isEmpty(inferredMetadata?.issue?.number) ? (
                  <span className="tag is-primary is-light">
                    {inferredMetadata?.issue?.number}
                  </span>
                ) : null}
              </dd>
            </div>

            {/* MIME type display with icon */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                MIMEType
              </dt>
              <dd className="mt-1 text-sm text-gray-500 dark:text-slate-900">
                <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                  {/* File type icon */}
                  <span className="pt-1">
                    <i className="icon-[solar--zip-file-bold-duotone] w-5 h-5"></i>
                  </span>
                  <span className="text-md text-slate-500 dark:text-slate-900">
                    {rawFileDetails?.mimeType}
                  </span>
                </span>
              </dd>
            </div>

            {/* File size display with human-readable formatting */}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                File Size
              </dt>
              <dd className="mt-1 text-sm text-gray-500 dark:text-slate-900">
                <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                  {/* File size icon */}
                  <span className="pr-1 pt-1">
                    <i className="icon-[solar--mirror-right-bold-duotone] w-5 h-5"></i>
                  </span>
                  <span className="text-md text-slate-500 dark:text-slate-900">
                    {/* Use pretty-bytes library for human-readable file sizes, fallback to N/A */}
                    {rawFileDetails?.fileSize ? prettyBytes(rawFileDetails.fileSize) : "N/A"}
                  </span>
                </span>
              </dd>
            </div>

            {/* Import timestamp with date formatting */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Import Details
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-400">
                {/* Validate and format creation date, fallback to N/A if invalid */}
                {createdAt && isValid(parseISO(createdAt)) ? (
                  <>
                    {format(parseISO(createdAt), "dd MMMM, yyyy")},{" "}
                    {format(parseISO(createdAt), "h aaaa")}
                  </>
                ) : "N/A"}
              </dd>
            </div>

            {/* Actions section for child components (buttons, dropdowns, etc.) */}
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
