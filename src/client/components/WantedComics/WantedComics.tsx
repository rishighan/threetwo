import React, { ReactElement, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import SearchBar from "../Library/SearchBar";
import T2Table from "../shared/T2Table";
import { isEmpty, isUndefined } from "lodash";
import MetadataPanel from "../shared/MetadataPanel";

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
            accessor: "_source",
            Cell: ({ value }) => <MetadataPanel data={value} />,
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
