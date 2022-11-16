import React, { ReactElement, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import Card from "../Carda";
import T2Table from "../shared/T2Table";
import ellipsize from "ellipsize";
import { convert } from "html-to-text";
import { isUndefined } from "lodash";

export const Volumes = (props): ReactElement => {
  const volumes = useSelector((state: RootState) => state.fileOps.volumes);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      searchIssue(
        {
          query: {},
        },
        {
          pagination: {
            size: 25,
            from: 0,
          },
          type: "volumes",
          trigger: "volumesPage",
        },
      ),
    );
  }, []);
  const columnData = useMemo(
    () => [
      {
        header: "Volume Details",
        id: "volumeDetails",
        minWidth: 450,
        accessorKey: "_source",
        cell: (row) => {
          const foo = row.getValue();
          return (
            <div className="columns">
              <div className="column">
                <div className="comic-detail issue-metadata">
                  <dl>
                    <dd>
                      <div className="columns mt-2">
                        <div className="">
                          <Card
                            imageUrl={
                              foo.sourcedMetadata.comicvine.volumeInformation
                                .image.thumb_url
                            }
                            orientation={"vertical"}
                            hasDetails={false}
                            // cardContainerStyle={{ maxWidth: 200 }}
                          />
                        </div>
                        <div className="column">
                          <dl>
                            <dt>
                              <h6 className="name has-text-weight-medium mb-1">
                                {
                                  foo.sourcedMetadata.comicvine
                                    .volumeInformation.name
                                }
                              </h6>
                            </dt>
                            <dd className="is-size-7">
                              published by{" "}
                              <span className="has-text-weight-semibold">
                                {
                                  foo.sourcedMetadata.comicvine
                                    .volumeInformation.publisher.name
                                }
                              </span>
                            </dd>

                            <dd className="is-size-7">
                              <span>
                                {ellipsize(
                                  convert(
                                    foo.sourcedMetadata.comicvine
                                      .volumeInformation.description,
                                    {
                                      baseElements: {
                                        selectors: ["p"],
                                      },
                                    },
                                  ),
                                  120,
                                )}
                              </span>
                            </dd>

                            <dd className="is-size-7 mt-2">
                              <div className="field is-grouped is-grouped-multiline">
                                <div className="control">
                                  <span className="tags">
                                    <span className="tag is-success is-light has-text-weight-semibold">
                                      Total Issues
                                    </span>
                                    <span className="tag is-success is-light">
                                      {
                                        foo.sourcedMetadata.comicvine
                                          .volumeInformation.count_of_issues
                                      }
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
      {
        header: "Download Status",
        columns: [
          {
            header: "Files",
            accessorKey: "_source.acquisition.directconnect",
            align: "right",
            cell: (props) => {
              const row = props.getValue();
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  {row.length > 0 ? (
                    <span className="tag is-warning">{row.length}</span>
                  ) : null}
                </div>
              );
            },
          },
          {
            header: "Type",
            id: "Air",
          },
          {
            header: "Type",
            id: "dcc",
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
          <h1 className="title">Volumes</h1>
        </div>
        {!isUndefined(volumes.hits) && (
          <div>
            <div className="library">
              <T2Table
                sourceData={volumes?.hits?.hits}
                totalPages={volumes.hits.hits.length}
                paginationHandlers={{
                  nextPage: () => {},
                  previousPage: () => {},
                }}
                columns={columnData}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Volumes;
