import React, { useState, useEffect, useMemo, ReactElement } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTable, usePagination } from "react-table";
import { useDispatch, useSelector } from "react-redux";
import { getComicBooks } from "../actions/fileops.actions";
import { isEmpty, isNil, isUndefined } from "lodash";
import RawFileDetails from "./Library/RawFileDetails";
import ComicVineDetails from "./Library/ComicVineDetails";
import SearchBar from "./Library/SearchBar";

interface IComicBookLibraryProps {
  matches?: unknown;
}

export const Library = ({}: IComicBookLibraryProps): ReactElement => {
  const [isPageSizeDropdownCollapsed, collapsePageSizeDropdown] =
    useState(false);

  const data = useSelector(
    (state: RootState) => state.fileOps.recentComics.docs,
  );
  const pageTotal = useSelector(
    (state: RootState) => state.fileOps.recentComics.totalDocs,
  );
  const togglePageSizeDropdown = () =>
    collapsePageSizeDropdown(!isPageSizeDropdownCollapsed);

  // programatically navigate to comic detail
  const navigate = useNavigate();
  const navigateToComicDetail = (id) => {
    navigate(`/comic/details/${id}`);
  };

  const ImportStatus = ({ value }) => {
    return value ? (
      <span className="tag is-info is-light">Imported</span>
    ) : (
      "Not Imported"
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "Comic Metadata",
        columns: [
          {
            Header: "File Details",
            id: "fileDetails",
            accessor: (row) =>
              !isEmpty(row.rawFileDetails.cover)
                ? row.rawFileDetails
                : row.sourcedMetadata,
            Cell: ({ value }) => {
              // If no CV info available, use raw file metadata
              if (!isNil(value.cover)) {
                return <RawFileDetails data={value} />;
              }
              // If CV metadata available, show it
              if (!isNil(value.comicvine)) {
                return <ComicVineDetails data={value} />;
              }
              return <div>null</div>;
            },
          },
          {
            Header: "Import Status",
            accessor: "importStatus.isImported",
            Cell: ImportStatus,
          },
        ],
      },
      {
        Header: "ComicVine Metadata",
        columns: [
          {
            Header: "Issue #",
            accessor: "sourcedMetadata",
            Cell(props) {
              return (
                !isUndefined(props.cell.value) &&
                !isUndefined(props.cell.value.comicvine) && (
                  <div>{props.cell.value.comicvine.issue_number}</div>
                )
              );
            },
          },

          {
            Header: "Publisher",
            accessor: "sourcedMetadata.comicvine.volumeInformation.publisher",
            Cell(props) {
              return (
                !isNil(props.cell.value) && <h6>{props.cell.value.name}</h6>
              );
            },
          },

          {
            Header: "Type",
            accessor: "sourcedMetadata.comicvine",
            Cell(props) {
              return (
                !isEmpty(props.cell.value) && (
                  <span className="tag is-info is-light">
                    {props.cell.value.resource_type}
                  </span>
                )
              );
            },
          },

          {
            Header: "Volume",
            accessor: "sourcedMetadata.comicvine.volumeInformation",
            Cell(props) {
              return (
                !isNil(props.cell.value) && <h6>{props.cell.value.name}</h6>
              );
            },
          },

          {
            Header: "Match Score",
            accessor: "sourcedMetadata.comicvine.score",
            Cell(props) {
              return (
                !isNil(props.cell.value) && (
                  <span className="tag is-success is-light">
                    {parseInt(props.cell.value, 10)}
                  </span>
                )
              );
            },
          },
        ],
      },
    ],
    [],
  );

  ImportStatus.propTypes = {
    value: PropTypes.bool.isRequired,
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      manualPagination: true,
      initialState: {
        pageIndex: 1,
        pageSize: 15,
      },
      pageCount: pageTotal,
    },
    usePagination,
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      getComicBooks({
        paginationOptions: {
          page: pageIndex,
          limit: pageSize,
        },
      }),
    );
  }, [pageIndex, pageSize]);

  return (
    <section className="container">
      <div className="section">
        <h1 className="title">Library</h1>
        {/* Search bar */}
        <SearchBar />
        {!isUndefined(data) ? (
          <div>
            <div className="library">
              <table {...getTableProps()} className="table is-hoverable">
                <thead>
                  {headerGroups.map((headerGroup, idx) => (
                    <tr key={idx} {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column, idx) => (
                        <th key={idx} {...column.getHeaderProps()}>
                          {column.render("Header")}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody {...getTableBodyProps()}>
                  {page.map((row, idx) => {
                    prepareRow(row);
                    return (
                      <tr
                        key={idx}
                        {...row.getRowProps()}
                        onClick={() => navigateToComicDetail(row.original._id)}
                      >
                        {row.cells.map((cell, idx) => {
                          return (
                            <td
                              key={idx}
                              {...cell.getCellProps()}
                              className="is-vcentered"
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* pagination controls */}
              <nav
                className="pagination"
                role="navigation"
                aria-label="pagination"
              >
                {/* x of total indicator */}
                <div>
                  Page {pageIndex} of {Math.ceil(pageTotal / pageSize)}
                  (Total resources: {pageTotal})
                </div>

                {/* previous page and next page controls */}
                <div className="field has-addons">
                  <p className="control">
                    <button
                      className="button"
                      onClick={() => previousPage()}
                      disabled={!canPreviousPage}
                    >
                      Previous Page
                    </button>
                  </p>
                  <p className="control">
                    <button
                      className="button"
                      onClick={() => nextPage()}
                      disabled={!canNextPage}
                    >
                      <span>Next Page</span>
                    </button>
                  </p>
                </div>

                {/* first and last page controls */}
                <div className="field has-addons">
                  <p className="control">
                    <button
                      className="button"
                      onClick={() => gotoPage(1)}
                      disabled={!canPreviousPage}
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                  </p>
                  <p className="control">
                    <button
                      className="button"
                      onClick={() => gotoPage(Math.ceil(pageTotal / pageSize))}
                      disabled={!canNextPage}
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </p>
                </div>

                {/* page selector */}
                <span>
                  Go to page:
                  <input
                    type="number"
                    className="input"
                    defaultValue={pageIndex}
                    onChange={(e) => {
                      const page = e.target.value ? Number(e.target.value) : 0;
                      gotoPage(page);
                    }}
                    style={{ width: "100px" }}
                  />
                </span>

                {/* page size selector */}
                <div
                  className={
                    "dropdown " +
                    (isPageSizeDropdownCollapsed ? "is-active" : "")
                  }
                  onBlur={() => togglePageSizeDropdown()}
                >
                  <div className="dropdown-trigger">
                    <button
                      className="button"
                      aria-haspopup="true"
                      aria-controls="dropdown-menu"
                      onClick={() => togglePageSizeDropdown()}
                    >
                      <span>Select Page Size</span>
                      <span className="icon is-small">
                        <i className="fas fa-angle-down" aria-hidden="true"></i>
                      </span>
                    </button>
                  </div>
                  <div className="dropdown-menu" id="dropdown-menu" role="menu">
                    <div className="dropdown-content">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <a href="#" className="dropdown-item" key={pageSize}>
                          Show {pageSize}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Library;
