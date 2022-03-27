import React, { ReactElement, useEffect, useMemo } from "react";
import T2Table from "../shared/T2Table";
import { getWeeklyPullList } from "../../actions/comicinfo.actions";
import { useDispatch, useSelector } from "react-redux";
import Card from "../Carda";
import ellipsize from "ellipsize";

export const PullList = (): ReactElement => {
  const pullListComics = useSelector(
    (state: RootState) => state.comicInfo.pullList,
  );
  console.log(pullListComics);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      getWeeklyPullList({
        startDate: "2022-4-8",
        pageSize: "100",
        currentPage: "1",
      }),
    );
  }, []);
  const nextPageHandler = () => {};
  const previousPageHandler = () => {};
  const columnData = useMemo(
    () => [
      {
        Header: "Comic Information",
        columns: [
          {
            Header: "Details",
            id: "comicDetails",
            minWidth: 450,
            accessor: (row) => {
              console.log(row);
              return (
                <div className="columns">
                  <div className="column">
                    <div className="comic-detail issue-metadata">
                      <dl>
                        <dd>
                          <div className="columns mt-2">
                            <div className="column is-3">
                              <Card
                                imageUrl={row.cover}
                                orientation={"vertical"}
                                hasDetails={false}
                                // cardContainerStyle={{ maxWidth: 200 }}
                              />
                            </div>
                            <div className="column">
                              <dl>
                                <dt>
                                  <h6 className="name has-text-weight-medium mb-1">
                                    {row.name}
                                  </h6>
                                </dt>
                                <dd className="is-size-7">
                                  published by{" "}
                                  <span className="has-text-weight-semibold">
                                    {row.publisher}
                                  </span>
                                </dd>

                                <dd className="is-size-7">
                                  <span>{ellipsize(row.description, 190)}</span>
                                </dd>

                                <dd className="is-size-7 mt-2">
                                  <div className="field is-grouped is-grouped-multiline">
                                    <div className="control">
                                      <span className="tags">
                                        <span className="tag is-success is-light has-text-weight-semibold">
                                          {row.price}
                                        </span>
                                        <span className="tag is-success is-light">
                                          {row.pulls}
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
        <h1 className="title">Weekly Pull List</h1>
        <T2Table
          rowData={pullListComics}
          columns={columnData}
          totalPages={pullListComics.length}
          paginationHandlers={{
            nextPage: nextPageHandler,
            previousPage: previousPageHandler,
          }}
        />
      </div>
    </section>
  );
};

export default PullList;
