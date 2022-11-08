import React, { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import SearchBar from "../Library/SearchBar";
import T2Table from "../shared/T2Table";
import { isEmpty, isUndefined } from "lodash";
import MetadataPanel from "../shared/MetadataPanel";

export const WantedComics = (props): ReactElement => {
  const wantedComics = useSelector(
    (state: RootState) => state.fileOps.wantedComics,
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
          trigger: "wantedComicsPage"
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

  /**
   * Pagination control that fetches the next x (pageSize) items
   * based on the y (pageIndex) offset from the Elasticsearch index
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns void
   *  
   **/
  const nextPage = useCallback((pageIndex: number, pageSize: number) => {
    dispatch(
      searchIssue(
        {
          query: {},
        },
        {
          pagination: {
            size: pageSize,
            from: pageSize * pageIndex + 1,
          },
          type: "all",
          trigger: "wantedComicsPage",
        },
      ),
    );
  }, []);


  /**
   * Pagination control that fetches the previous x (pageSize) items
   * based on the y (pageIndex) offset from the Elasticsearch index
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns void
   **/
  const previousPage = useCallback((pageIndex: number, pageSize: number) => {
    let from = 0;
    if (pageIndex === 2) {
      from = (pageIndex - 1) * pageSize + 2 - 17;
    } else {
      from = (pageIndex - 1) * pageSize + 2 - 16;
    }
    dispatch(
      searchIssue(
        {
          query: {},
        },
        {
          pagination: {
            size: pageSize,
            from,
          },
          type: "all",
          trigger: "wantedComicsPage"
        },
      ),
    );
  }, []);

  return (
    <section className="container">
      <div className="section">
        <div className="header-area">
          <h1 className="title">Wanted Comics</h1>
        </div>
        {!isEmpty(wantedComics) && (
          <div>
            <div className="library">
              <T2Table
                sourceData={wantedComics}
                totalPages={wantedComics.length}
                columns={columnData}
                paginationHandlers={{
                  nextPage: nextPage,
                  previousPage: previousPage,
                }}
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
