import React, { ReactElement, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import Card from "../Carda";
import SearchBar from "../Library/SearchBar";
import T2Table from "../shared/T2Table";
import ellipsize from "ellipsize";
import { isEmpty, isUndefined } from "lodash";
import { convert } from "html-to-text";

export const WantedComics = (props): ReactElement => {
  const wantedComics = useSelector(
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
          type: "wanted",
        },
      ),
    );
  }, []);
  const columnData = useMemo(
    () => [
      {
        Header: "Comic Information",
        columns: [
          {
            Header: "Details",
            id: "comicDetails",
            minWidth: 350,
            accessor: (row) => {
              console.log(row);
              return row._source.sourcedMetadata.comicvine.volumeInformation ? (
                <div className="columns">
                  <div className="column">
                    <div className="comic-detail issue-metadata">
                      <dl>
                        <dd>
                          <div className="columns mt-2">
                            <div className="column is-3">
                              {!isUndefined(
                                row._source.sourcedMetadata.comicvine.image,
                              ) && (
                                <Card
                                  imageUrl={
                                    row._source.sourcedMetadata.comicvine.image
                                      .thumb_url
                                  }
                                  orientation={"vertical"}
                                  hasDetails={false}
                                  // cardContainerStyle={{ maxWidth: 200 }}
                                />
                              )}
                            </div>
                            <div className="column">
                              <dl>
                                <dd>
                                  {row._source.sourcedMetadata.comicvine.name
                                    ? row._source.sourcedMetadata.comicvine.name
                                    : "No Name"}
                                </dd>
                                <dd>
                                  <h6 className="name has-text-weight-medium mb-1">
                                    {
                                      row._source.sourcedMetadata.comicvine
                                        .volumeInformation.name
                                    }
                                  </h6>
                                </dd>
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
                                          .description,
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
                                          {
                                            row._source.sourcedMetadata
                                              .comicvine.volumeInformation.id
                                          }
                                        </span>
                                      </span>
                                    </div>
                                    <div className="control">
                                      <span className="tags has-addons">
                                        <span className="tag">
                                          ComicVine Id
                                        </span>
                                        <span className="tag is-success is-light">
                                          {
                                            row._source.sourcedMetadata
                                              .comicvine.id
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
              ) : null;
            },
          },
        ],
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
        <h1 className="title">Wanted Comics</h1>
        {/* Search bar */}
        <SearchBar />
        {!isUndefined(wantedComics.hits) && (
          <div>
            <div className="library">
              <T2Table
                rowData={wantedComics.hits.hits}
                totalPages={wantedComics.hits.total.value}
                columns={columnData}
                // paginationHandlers={{
                //   nextPage: goToNextPage,
                //   previousPage: goToPreviousPage,
                // }}
                // rowClickHandler={navigateToComicDetail}
              />
              {/* pagination controls */}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WantedComics;
