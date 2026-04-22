/**
 * @fileoverview Weekly Pull List page — displays comics releasing this week
 * that the user has marked to follow.
 * @module components/PullList/PullList
 */

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import T2Table from "../shared/T2Table";
import Card from "../shared/Carda";
import ellipsize from "ellipsize";
import { isNil } from "lodash";
import type { CellContext } from "@tanstack/react-table";

interface PullListComic {
  issue: {
    cover: string;
    name: string;
    publisher: string;
    description: string;
    price: string;
    pulls: number;
  };
}

/**
 * Weekly Pull List page component.
 *
 * Displays comics releasing this week that the user tracks.
 * Fetching is not yet implemented — state is initialised to `null`
 * so the table renders only when data is available, avoiding an empty-table flash.
 *
 * @returns {ReactElement} The pull list page UI
 */
export const PullList = (): ReactElement => {
  // Placeholder for pull list comics - would come from API/store
  const [pullListComics, setPullListComics] = useState<PullListComic[] | null>(null);

  useEffect(() => {
    // TODO: Implement pull list fetching
    // dispatch(
    //   getWeeklyPullList({
    //     startDate: "2023-7-28",
    //     pageSize: "15",
    //     currentPage: "1",
    //   }),
    // );
  }, []);
  const nextPageHandler = () => {};
  const previousPageHandler = () => {};
  // Column def memoised — shape is static, no deps needed
  const columnData = useMemo(
    () => [
      {
        header: "Comic Information",
        columns: [
          {
            header: "Details",
            id: "comicDetails",
            minWidth: 450,
            accessorKey: "issue",
            cell: (row: CellContext<PullListComic, PullListComic["issue"]>) => {
              const item = row.getValue();
              return (
                <div className="columns">
                  <div className="column is-three-quarters">
                    <div className="comic-detail issue-metadata">
                      <dl>
                        <dd>
                          <div className="columns mt-2">
                            <div className="column is-3">
                              <Card
                                imageUrl={item.cover}
                                orientation={"vertical"}
                                hasDetails={false}
                                // cardContainerStyle={{ maxWidth: 200 }}
                              />
                            </div>
                            <div className="column">
                              <dl>
                                <dt>
                                  <h6 className="name has-text-weight-medium mb-1">
                                    {item.name}
                                  </h6>
                                </dt>
                                <dd className="is-size-7">
                                  published by{" "}
                                  <span className="has-text-weight-semibold">
                                    {item.publisher}
                                  </span>
                                </dd>

                                <dd className="is-size-7">
                                  <span>
                                    {ellipsize(item.description, 190)}
                                  </span>
                                </dd>

                                <dd className="is-size-7 mt-2">
                                  <div className="field is-grouped is-grouped-multiline">
                                    <div className="control">
                                      <span className="tags">
                                        <span className="tag is-success is-light has-text-weight-semibold">
                                          {item.price}
                                        </span>
                                        <span className="tag is-success is-light">
                                          {item.pulls}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              );
            },
          },
        ],
      },
    ],
    [],
  );
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="section">
        <div className="header-area">
          <h1 className="title">Weekly Pull List</h1>
        </div>
        {!isNil(pullListComics) && (
          <div>
            <div className="library">
              <T2Table
                sourceData={pullListComics}
                columns={columnData}
                totalPages={pullListComics.length}
                paginationHandlers={{
                  nextPage: nextPageHandler,
                  previousPage: previousPageHandler,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PullList;
