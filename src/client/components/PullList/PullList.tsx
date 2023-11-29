import React, { ReactElement, useEffect, useMemo } from "react";
import T2Table from "../shared/T2Table";
import { getWeeklyPullList } from "../../actions/comicinfo.actions";
import Card from "../shared/Carda";
import ellipsize from "ellipsize";
import { isNil } from "lodash";

export const PullList = (): ReactElement => {
  // const pullListComics = useSelector(
  //   (state: RootState) => state.comicInfo.pullList,
  // );

  useEffect(() => {
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
            cell: (row) => {
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
    <section className="container">
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
