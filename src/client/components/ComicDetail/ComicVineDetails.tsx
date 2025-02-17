import React, { ReactElement } from "react";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import dayjs from "dayjs";
import { isEmpty, isUndefined } from "lodash";
import Card from "../shared/Carda";
import { convert } from "html-to-text";

interface ComicVineDetailsProps {
  updatedAt?: string;
  data?: {
    name?: string;
    number?: string;
    resource_type?: string;
    id?: number;
  };
}

export const ComicVineDetails = (props: ComicVineDetailsProps): ReactElement => {
  const { data, updatedAt } = props;
  return (
    <div className="text-slate-500 dark:text-gray-400">
      <div className="">
        <div>
          <div className="flex flex-row gap-4">
            <div className="min-w-fit">
              <Card
                imageUrl={data.volumeInformation.image.thumb_url}
                orientation={"cover-only"}
                hasDetails={false}
                // cardContainerStyle={{ maxWidth: 200 }}
              />
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-row">
                <div>
                  {/* Title */}
                  <div>
                    <div className="text-lg">{data.name}</div>
                    <div className="text-sm">
                      Is a part of{" "}
                      <span className="has-text-info">
                        {data.volumeInformation.name}
                      </span>
                    </div>
                  </div>

                  {/* Comicvine metadata */}
                  <div className="mt-2">
                    <div className="text-md">ComicVine Metadata</div>
                    <div className="text-sm">
                      Last scraped on{" "}
                      {dayjs(updatedAt).format("MMM D YYYY [at] h:mm a")}
                    </div>
                    <div className="text-sm">
                      ComicVine Issue ID
                      <span>{data.id}</span>
                    </div>
                  </div>
                </div>

                {/* Publisher details */}
                <div className="ml-8">
                  Published by{" "}
                  <span>{data.volumeInformation.publisher.name}</span>
                  <div>
                    Total issues in this volume{" "}
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="text-md text-slate-900 dark:text-slate-900">
                        {data.volumeInformation.count_of_issues}
                      </span>
                    </span>
                  </div>
                  <div>
                    {data.issue_number && (
                      <div className="">
                        <span>Issue Number</span>
                        <span>{data.issue_number}</span>
                      </div>
                    )}
                    {!isUndefined(
                      detectIssueTypes(data.volumeInformation.description),
                    ) ? (
                      <div>
                        <span>Detected Type</span>
                        <span>
                          {
                            detectIssueTypes(data.volumeInformation.description)
                              .displayName
                          }
                        </span>
                      </div>
                    ) : data.resource_type ? (
                      <div>
                        <span>Type</span>
                        <span>{data.resource_type}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="mt-3 w-3/4">
                {!isEmpty(data.description) &&
                  convert(data.description, {
                    baseElements: {
                      selectors: ["p"],
                    },
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicVineDetails;
