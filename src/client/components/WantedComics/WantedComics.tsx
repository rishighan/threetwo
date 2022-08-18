import React, { ReactElement, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import SearchBar from "../Library/SearchBar";
import T2Table from "../shared/T2Table";
import { isEmpty, isUndefined } from "lodash";
import MetadataPanel from "../shared/MetadataPanel";

export const WantedComics = (props): ReactElement => {
  const wantedComics = useSelector(
    (state: RootState) => state.fileOps.librarySearchResultsFormatted,
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

  const columnData = [
    {
      header: "Comic Information",
      columns: [
        {
          header: "Details",
          id: "comicDetails",
          minWidth: 350,
          accessorFn: data => data,
          cell: (value) => <MetadataPanel data={value.getValue()} />,
        },
      ],
    },
    {
      header: "Download Status",
      columns: [
        {
          header: "Files",
          accessorKey: "acquisition",
          align: "right",
          cell: props => {
            const { directconnect: { downloads } } = props.getValue();
            return (
              <div
                style={{
                  display: "flex",
                  // flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {downloads.length > 0 ? (
                  <span className="tag is-warning">
                    {downloads.length}
                  </span>
                ) : null}
              </div>
            );
          },
        },
        {
          header: "Download Details",
          id: "downloadDetails",
          accessorKey: "acquisition",
          cell: data => <ol>
            {data.getValue().directconnect.downloads.map(download => {
              return <li className="is-size-7">{download.name}</li>;
            })}
          </ol>
        },
        {
          header: "Type",
          id: "dcc",
        },
      ],
    },
  ];

  return (
    <section className="container">
      <div className="section">
        <h1 className="title">Wanted Comics</h1>
        {/* Search bar */}
        <SearchBar />
        {!isEmpty(wantedComics) && (
          <div>
            <div className="library">
              <T2Table
                rowData={wantedComics}
                totalPages={wantedComics.length}
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
