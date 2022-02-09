import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import dayjs from "dayjs";
import { isUndefined } from "lodash";

export const ComicVineDetails = (props): ReactElement => {
  const { data, updatedAt } = props;
  return (
    <div className="content comic-detail comicvine-metadata">
      <dl>
        <dt>ComicVine Metadata</dt>
        <dd className="is-size-7">
          Last scraped on {dayjs(updatedAt).format("MMM D YYYY [at] h:mm a")}
        </dd>
        <dd>
          <h6>{data.name}</h6>
        </dd>
        {data.issue_number && (
          <dd className="mb-2">
            <div className="tags has-addons">
              <span className="tag is-light">Issue Number</span>
              <span className="tag is-warning">{data.issue_number}</span>
            </div>
          </dd>
        )}
        <dd>
          <div className="field is-grouped is-grouped-multiline">
            {!isUndefined(
              detectIssueTypes(data.volumeInformation.description),
            ) ? (
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag is-light">Detected Type</span>
                  <span className="tag is-warning">
                    {
                      detectIssueTypes(data.volumeInformation.description)
                        .displayName
                    }
                  </span>
                </div>
              </div>
            ) : data.resource_type ? (
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag is-light">Type</span>
                  <span className="tag is-warning">{data.resource_type}</span>
                </div>
              </div>
            ) : null}
            <div className="control">
              <div className="tags has-addons">
                <span className="tag is-light">ComicVine Issue ID</span>
                <span className="tag is-success">{data.id}</span>
              </div>
            </div>
          </div>
        </dd>
      </dl>
    </div>
  );
};

export default ComicVineDetails;

ComicVineDetails.propTypes = {
  updatedAt: PropTypes.string,
  data: PropTypes.shape({
    name: PropTypes.string,
    number: PropTypes.string,
    resource_type: PropTypes.string,
    id: PropTypes.number,
  }),
};
