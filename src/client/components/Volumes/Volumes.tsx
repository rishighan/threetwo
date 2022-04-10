import React, { ReactElement, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import Card from "../Carda";
import SearchBar from "../Library/SearchBar";
import T2Table from "../shared/T2Table";
import ellipsize from "ellipsize";
import { isUndefined } from "lodash";
import { convert } from "html-to-text";

export const Volumes = (props): ReactElement => {
  const volumes = useSelector(
    (state: RootState) => state.fileOps.librarySearchResults,
  );
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
        },
      ),
    );
  }, []);
  console.log(volumes);

  const columnData = useMemo(
    () => [
      {
        Header: "Volume Details",
        id: "volumeDetails",
        minWidth: 450,
        accessor: (row) => {
          return (
            <div className="columns">
              <div className="column">
                <div className="comic-detail issue-metadata">
                  <dl>
                    <dd>
                      <div className="columns mt-2">
                        <div className="column is-3">
                          <Card
                            imageUrl={
                              row._source.sourcedMetadata.comicvine
                                .volumeInformation.image.thumb_url
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
                                  row._source.sourcedMetadata.comicvine
                                    .volumeInformation.name
                                }
                              </h6>
                            </dt>
                            <dd className="is-size-7">
                              published by{" "}
                              <span className="has-text-weight-semibold">
                                {
                                  row._source.sourcedMetadata.comicvine
                                    .volumeInformation.publisher.name
                                }
                              </span>
                            </dd>

                            <dd className="is-size-7">
                              <span>
                                {ellipsize(
                                  convert(
                                    row._source.sourcedMetadata.comicvine
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
                                        row._source.sourcedMetadata.comicvine
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
        Header: "Download Status",
        columns: [
          {
            Header: "Files",
            accessor: "_source.acquisition.directconnect",
            align: "right",
            Cell: (props) => {
              return (
                <div
                  style={{
                    display: "flex",
                    // flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  {props.cell.value.length > 0 ? (
                    <span className="tag is-warning">
                      {props.cell.value.length}
                    </span>
                  ) : null}
                </div>
              );
            },
          },
          {
            Header: "Type",
            id: "Air",
          },
          {
            Header: "Type",
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
        {volumes.hits ? (
          <div>
            <div className="library">
              <h1 className="title">Volumes</h1>
              {/* Search bar */}
              <SearchBar />
              <T2Table rowData={volumes.hits.hits} columns={columnData} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Volumes;
