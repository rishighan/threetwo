import React, { ReactElement } from "react";
import ellipsize from "ellipsize";
import prettyBytes from "pretty-bytes";
import { Card } from "../shared/Carda";
import { convert } from "html-to-text";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import { find, isUndefined } from "lodash";

/**
 * Props for the MetadataPanel component.
 */
interface MetadataPanelProps {
  /**
   * Comic metadata object passed into the panel.
   */
  data: any;

  /**
   * Optional custom styling for the cover image.
   */
  imageStyle?: React.CSSProperties;

  /**
   * Optional custom styling for the title section.
   */
  titleStyle?: React.CSSProperties;
}

/**
 * MetadataPanel component
 *
 * Displays structured comic metadata based on the best available source
 * (raw file data, ComicVine, or League of Comic Geeks).
 *
 * @component
 * @param {MetadataPanelProps} props
 * @returns {ReactElement}
 */
export const MetadataPanel = (props: MetadataPanelProps): ReactElement => {
  const {
    rawFileDetails,
    inferredMetadata,
    sourcedMetadata: { comicvine, locg },
  } = props.data;

  const { issueName, url, objectReference } = determineCoverFile({
    comicvine,
    locg,
    rawFileDetails,
  });
  const metadataContentPanel = [
    {
      name: "rawFileDetails",
      content: () => (
        <dl className="dark:bg-[#647587] bg-slate-200 p-3 rounded-lg">
          <dt>
            <p className="text-lg">{issueName}</p>
          </dt>
          <dd className="text-sm">
            is a part of{" "}
            <span className="underline">
              {inferredMetadata.issue.name}
              <i className="icon-[solar--arrow-right-up-outline] w-4 h-4" />
            </span>
          </dd>

          {inferredMetadata.issue.number && (
            <dd className="my-2">
              <span className="inline-flex items-center bg-slate-100 dark:bg-slate-400 text-slate-800 dark:text-slate-900 text-xs font-medium px-2 py-1 rounded-md">
                <i className="icon-[solar--hashtag-bold-duotone] w-4 h-4 mr-1 opacity-70"></i>
                <span>{inferredMetadata.issue.number}</span>
              </span>
            </dd>
          )}

          <dd className="flex flex-row gap-2 w-max">
            <span className="inline-flex items-center bg-slate-100 dark:bg-slate-400 text-slate-800 dark:text-slate-900 text-xs font-medium px-2 py-1 rounded-md">
              <i className="icon-[solar--file-text-bold-duotone] w-4 h-4 mr-1 opacity-70" />
              {rawFileDetails.mimeType}
            </span>

            <span className="inline-flex items-center bg-slate-100 dark:bg-slate-400 text-slate-800 dark:text-slate-900 text-xs font-medium px-2 py-1 rounded-md">
              <i className="icon-[solar--database-bold-duotone] w-4 h-4 mr-1 opacity-70" />
              {prettyBytes(rawFileDetails.fileSize)}
            </span>

            {rawFileDetails.archive?.uncompressed && (
              <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                <i className="icon-[solar--bookmark-bold-duotone] w-3.5 h-3.5 pr-1 pt-1" />
              </span>
            )}
          </dd>
        </dl>
      ),
    },

    {
      name: "comicvine",
      content: () => {
        return (
          !isUndefined(comicvine?.volumeInformation) && (
            <dl className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {/* Title */}
              <dt className="text-base font-semibold text-slate-900 dark:text-white">
                {ellipsize(issueName, 28)}
              </dt>

              {/* Volume Name */}
              <dd>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Part of{" "}
                  <span className="font-medium text-slate-800 dark:text-white">
                    {comicvine.volumeInformation.name}
                  </span>
                </span>
              </dd>

              {/* Description */}
              <dd className="text-slate-600 dark:text-slate-300">
                {ellipsize(
                  convert(comicvine.description || "", {
                    baseElements: { selectors: ["p"] },
                  }),
                  160,
                )}
              </dd>

              {/* Misc Info */}
              <dd className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-300">
                <span className="inline-flex items-center bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded-md">
                  <i className="icon-[solar--calendar-bold-duotone] w-4 h-4 mr-1 opacity-70" />
                  {comicvine.volumeInformation.start_year}
                </span>
                <span className="inline-flex items-center bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded-md">
                  <i className="icon-[solar--book-bold-duotone] w-4 h-4 mr-1 opacity-70" />
                  {comicvine.volumeInformation.count_of_issues} issues
                </span>
                <span className="inline-flex items-center bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded-md">
                  <i className="icon-[solar--hashtag-bold-duotone] w-4 h-4 mr-1 opacity-70" />
                  ID: {comicvine.id}
                </span>
              </dd>
            </dl>
          )
        );
      },
    },

    {
      name: "locg",
      content: () => (
        <dl>
          <dt>
            <h6 className="name has-text-weight-medium mb-1">
              {ellipsize(issueName, 28)}
            </h6>
          </dt>
          <dd className="is-size-7">
            <span>{ellipsize(locg?.description || "", 120)}</span>
          </dd>
          <dd className="is-size-7 mt-2">
            <div className="field is-grouped is-grouped-multiline">
              <div className="control">
                <span className="tags">
                  <span className="tag is-success is-light has-text-weight-semibold">
                    {locg?.price}
                  </span>
                  <span className="tag is-success is-light">{locg?.pulls}</span>
                </span>
              </div>
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag is-primary is-light">rating</span>
                  <span className="tag is-info is-light">{locg?.rating}</span>
                </div>
              </div>
            </div>
          </dd>
        </dl>
      ),
    },
  ];

  const metadataPanel = find(metadataContentPanel, {
    name: objectReference,
  });
  return (
    <div className="flex gap-5 my-3">
      <Card
        imageUrl={url}
        orientation="cover-only"
        hasDetails={false}
        imageStyle={props.imageStyle}
        cardContainerStyle={{ width: "190px", maxWidth: "230px" }}
      />
      <div>{metadataPanel?.content()}</div>
    </div>
  );
};

export default MetadataPanel;
