import React, {
  useState,
  useEffect,
  useMemo,
  ReactElement,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTable, usePagination } from "react-table";
import { isEmpty, isNil, isUndefined } from "lodash";
import RawFileDetails from "./RawFileDetails";
import ComicVineDetails from "./ComicVineDetails";
import SearchBar from "./SearchBar";
import { useDispatch } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";

interface IComicBookLibraryProps {
  data: {
    searchResults: any;
  };
}

export const Library = (data: IComicBookLibraryProps): ReactElement => {
  const { searchResults } = data.data;
  const pageTotal = searchResults.hits.total.value;
  const [isPageSizeDropdownCollapsed, collapsePageSizeDropdown] =
    useState(false);
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

  const WantedStatus = ({ value }) => {
    return value ? <span className="tag is-info is-light">Wanted</span> : null;
  };

  console.log(searchResults);
  // return null;
  const columns = useMemo(
    () => [
      {
        Header: "Comic Metadata",
        columns: [
          {
            Header: "File Details",
            id: "fileDetails",
            accessor: (row) =>
              !isEmpty(row._source.rawFileDetails)
                ? row._source.rawFileDetails
                : row._source.sourcedMetadata,
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
            accessor: "_source.importStatus.isImported",
            Cell: ImportStatus,
          },
        ],
      },
      {
        Header: "Additional Metadata",
        columns: [
          {
            Header: "Issue #",
            accessor: "_source.inferredMetadata.issue",
            Cell(props) {
              return (
                !isUndefined(props.cell.value) && (
                  <div className="control">
                    <div className="tags has-addons">
                      <span className="tag is-light is-warning">Inferred</span>
                      <span className="tag">{props.cell.value.number}</span>
                    </div>
                  </div>
                )
              );
            },
          },

          {
            Header: "Publisher",
            accessor:
              "_source.sourcedMetadata.comicvine.volumeInformation.publisher",
            Cell(props) {
              return (
                !isNil(props.cell.value) && <h6>{props.cell.value.name}</h6>
              );
            },
          },

          {
            Header: "Type",
            accessor: "_source.sourcedMetadata.comicvine",
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
            accessor: "_source.sourcedMetadata.comicvine.volumeInformation",
            Cell(props) {
              return (
                !isNil(props.cell.value) && <h6>{props.cell.value.name}</h6>
              );
            },
          },

          {
            Header: "Match Score",
            accessor: "_source.sourcedMetadata.comicvine.score",
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
      data: searchResults.hits.hits,
      manualPagination: true,
      initialState: {
        pageIndex: 1,
        pageSize: 25,
      },
      pageCount: searchResults.hits.total.value,
    },
    usePagination,
  );
  const dispatch = useDispatch();
  const goToNextPage = useCallback(() => {
    // incremement pageIndex
    nextPage();
    console.log(pageIndex);
    console.log("from", pageSize * pageIndex + 1);
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
        },
      ),
    );
  }, [pageIndex]);

  const goToPreviousPage = useCallback(() => {
    previousPage();
    let from = 0;
    if (pageIndex === 2) {
      from = (pageIndex - 1) * pageSize + 2 - 27;
    } else {
      from = (pageIndex - 1) * pageSize + 2 - 26;
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
        },
      ),
    );
  }, [pageIndex]);

  return (
    <section className="container">
      <div className="section">
        <h1 className="title">Library</h1>
        {/* Search bar */}
        <SearchBar />
        {!isUndefined(searchResults) && (
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
                      onClick={() => goToPreviousPage()}
                      disabled={!canPreviousPage}
                    >
                      Previous Page
                    </button>
                  </p>
                  <p className="control">
                    <button
                      className="button"
                      onClick={() => goToNextPage()}
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
        )}
      </div>
    </section>
  );
};

export default Library;
