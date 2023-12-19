import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import ellipsize from "ellipsize";
import prettyBytes from "pretty-bytes";
import { Card } from "../shared/Carda";
import { convert } from "html-to-text";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import { find, isUndefined } from "lodash";

interface IMetadatPanelProps {
  value: any;
  children: any;
  imageStyle: any;
  titleStyle: any;
  tagsStyle: any;
  containerStyle: any;
}
export const MetadataPanel = (props: IMetadatPanelProps): ReactElement => {
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
        <dl className="bg-[#647587] p-3 rounded-lg">
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

          {/* Issue number */}
          {inferredMetadata.issue.number && (
            <dd className="my-2">
              <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                <span className="pr-1 pt-1">
                  <i className="icon-[solar--hashtag-outline] w-3.5 h-3.5"></i>
                </span>
                <span className="text-md text-slate-900 dark:text-slate-900">
                  {inferredMetadata.issue.number}
                </span>
              </span>
            </dd>
          )}
          <dd className="flex flex-row gap-2 w-max">
            {/* File extension */}
            <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
              <span className="pr-1 pt-1">
                <i className="icon-[solar--zip-file-bold-duotone] w-5 h-5"></i>
              </span>

              <span className="text-md text-slate-500 dark:text-slate-900">
                {rawFileDetails.mimeType}
              </span>
            </span>

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
        </dl>
      ),
    },

    {
      name: "comicvine",
      content: () =>
        !isUndefined(comicvine) &&
        !isUndefined(comicvine.volumeInformation) && (
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
                  convert(comicvine.description, {
                    baseElements: {
                      selectors: ["p"],
                    },
                  }),
                  120,
                )}
              </span>
            </dd>

            <dd className="is-size-7 mt-2">
              <div className="field is-grouped is-grouped-multiline">
                <div className="control">
                  <span className="tags">
                    <span
                      className="tag is-success is-light has-text-weight-semibold"
                      style={props.tagsStyle}
                    >
                      {comicvine.volumeInformation.start_year}
                    </span>
                    <span
                      className="tag is-success is-light"
                      style={props.tagsStyle}
                    >
                      {comicvine.volumeInformation.count_of_issues}
                    </span>
                  </span>
                </div>
                <div className="control">
                  <div className="tags has-addons">
                    <span
                      className="tag is-primary is-light"
                      style={props.tagsStyle}
                    >
                      ComicVine ID
                    </span>
                    <span
                      className="tag is-info is-light"
                      style={props.tagsStyle}
                    >
                      {comicvine.id}
                    </span>
                  </div>
                </div>
              </div>
            </dd>
          </dl>
        ),
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
            <span>{ellipsize(locg.description, 120)}</span>
          </dd>

          <dd className="is-size-7 mt-2">
            <div className="field is-grouped is-grouped-multiline">
              <div className="control">
                <span className="tags">
                  <span className="tag is-success is-light has-text-weight-semibold">
                    {locg.price}
                  </span>
                  <span className="tag is-success is-light">{locg.pulls}</span>
                </span>
              </div>
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag is-primary is-light">rating</span>
                  <span className="tag is-info is-light">{locg.rating}</span>
                </div>
              </div>
            </div>
          </dd>
        </dl>
      ),
    },
  ];

  // Find the panel to display
  const metadataPanel = find(metadataContentPanel, {
    name: objectReference,
  });

  return (
    <div className="flex gap-5 my-3">
      <Card
        imageUrl={url}
        orientation={"cover-only"}
        hasDetails={false}
        imageStyle={props.imageStyle}
      />
      <div>{metadataPanel.content()}</div>
    </div>
  );
};

export default MetadataPanel;
