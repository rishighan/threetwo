import React, { ReactElement } from "react";
import ellipsize from "ellipsize";
import prettyBytes from "pretty-bytes";
import { Card } from "../shared/Carda";
import { convert } from "html-to-text";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import { find, isUndefined } from "lodash";
import { o } from "react-router/dist/development/fog-of-war-BLArG-qZ";

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
              <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                <i className="icon-[solar--hashtag-outline] w-3.5 h-3.5 pr-1 pt-1"></i>
                <span>{inferredMetadata.issue.number}</span>
              </span>
            </dd>
          )}

          <dd className="flex flex-row gap-2 w-max">
            <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
              <i className="icon-[solar--zip-file-bold-duotone] w-5 h-5 pr-1 pt-1" />
              {rawFileDetails.mimeType}
            </span>

            <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
              <i className="icon-[solar--mirror-right-bold-duotone] w-5 h-5 pr-1 pt-1" />
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
        console.log("comicvine:", comicvine);
        console.log("volumeInformation:", comicvine?.volumeInformation);
        return (
          !isUndefined(comicvine?.volumeInformation) && (
            <dl>
              <dt>
                <h6
                  className="name has-text-weight-medium mb-1"
                  style={props.titleStyle}
                >
                  {ellipsize(issueName, 18)}
                </h6>
              </dt>
              <dd>
                <span className="is-size-7">
                  Is a part of{" "}
                  <span className="has-text-weight-semibold">
                    {comicvine.volumeInformation.name}
                  </span>
                </span>
              </dd>
              <dd className="is-size-7">
                <span>
                  {ellipsize(
                    convert(comicvine.description || "", {
                      baseElements: { selectors: ["p"] },
                    }),
                    120,
                  )}
                </span>
              </dd>
              <dd className="is-size-7 mt-2">
                <span className="my-3 mx-2">
                  {comicvine.volumeInformation.start_year}
                </span>
                {comicvine.volumeInformation.count_of_issues}
                ComicVine ID: {comicvine.id}
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
      />
      <div>{metadataPanel?.content()}</div>
    </div>
  );
};

export default MetadataPanel;
