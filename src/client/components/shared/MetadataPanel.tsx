import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import ellipsize from "ellipsize";
import prettyBytes from "pretty-bytes";
import { Card } from "../Carda";
import { convert } from "html-to-text";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import { find, isUndefined } from "lodash";

interface IMetadatPanelProps {
  value: any;
  children: any;
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
        <dl>
          <dt>
            <h6 className="name has-text-weight-medium mb-1">{issueName}</h6>
          </dt>
          <dd className="is-size-7">
            Is a part of{" "}
            <span className="has-text-weight-semibold">
              {inferredMetadata.issue.name}
            </span>
          </dd>

          <dd className="is-size-7 mt-2">
            <div className="field is-grouped is-grouped-multiline">
              <div className="control">
                <span className="tags">
                  <span className="tag is-success is-light has-text-weight-semibold">
                    {rawFileDetails.extension}
                  </span>
                  <span className="tag is-success is-light">
                    {prettyBytes(rawFileDetails.fileSize)}
                  </span>
                </span>
              </div>
              <div className="control">
                {inferredMetadata.issue.number && (
                  <div className="tags has-addons">
                    <span className="tag is-light">Issue #</span>
                    <span className="tag is-warning">
                      {inferredMetadata.issue.number}
                    </span>
                  </div>
                )}
              </div>
            </div>
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
              <h6 className="name has-text-weight-medium mb-1">
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
                    <span className="tag is-success is-light has-text-weight-semibold">
                      {comicvine.volumeInformation.start_year}
                    </span>
                    <span className="tag is-success is-light">
                      {comicvine.volumeInformation.count_of_issues}
                    </span>
                  </span>
                </div>
                <div className="control">
                  <div className="tags has-addons">
                    <span className="tag is-primary is-light">
                      ComicVine ID
                    </span>
                    <span className="tag is-info is-light">{comicvine.id}</span>
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
    <div className="columns">
      <div className="column">
        <div className="comic-detail issue-metadata">
          <dl>
            <dd>
              <div className="columns mt-2">
                <div className="column is-3">
                  <Card
                    imageUrl={url}
                    orientation={"vertical"}
                    hasDetails={false}
                    // cardContainerStyle={{ maxWidth: 200 }}
                  />
                </div>
                <div className="column">{metadataPanel.content()}</div>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default MetadataPanel;
