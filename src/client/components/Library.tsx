import React, { useState, useEffect, useMemo, ReactElement } from "react";
import PropTypes from 'prop-types';
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { useTable, usePagination } from "react-table";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";
import { useDispatch, useSelector } from "react-redux";
import { getComicBooks } from "../actions/fileops.actions";
import { isNil } from "lodash";

interface IComicBookLibraryProps {
  matches?: unknown;
}

export const Library = ({}: IComicBookLibraryProps): ReactElement => {
  const [comicPage, setComicPage] = useState(1);
  const [isPageSizeDropdownCollapsed, collapsePageSizeDropdown] =
    useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      getComicBooks({
        paginationOptions: {
          page: comicPage,
          limit: 15,
        },
      }),
    );
  }, [comicPage, dispatch]);

  const data = useSelector(
    (state: RootState) => state.fileOps.recentComics.docs,
  );
  const togglePageSizeDropdown = () =>
    collapsePageSizeDropdown(!isPageSizeDropdownCollapsed);

  const columns = useMemo(
    () => [
      {
        Header: "Comic Metadata",
        columns: [
          {
            Header: "File Details",
            accessor: "rawFileDetails",
            // eslint-disable-next-line react/display-name
            Cell(props) {
              const encodedFilePath = encodeURI(
                "http://localhost:3000" +
                  removeLeadingPeriod(props.cell.value.path),
              );
              const filePath = escapePoundSymbol(encodedFilePath);
              return (
                <div className="card-container">
                  <div className="card">
                    <div className="is-horizontal">
                      <div className="card-image">
                        <figure>
                          <img className="image" src={filePath} />
                        </figure>
                      </div>
                      <ul className="card-content">
                        <li className="name has-text-weight-medium">
                          {ellipsize(props.cell.value.name, 18)}
                        </li>
                        <li>
                          <div className="control">
                            <div className="tags has-addons">
                              <span className="tag is-primary is-light">
                                {props.cell.value.extension}
                              </span>
                              <span className="tag is-info is-light">
                                {prettyBytes(props.cell.value.fileSize)}
                              </span>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: "Import Status",
            accessor: "importStatus.isImported",
            Cell(props) {
              return `${props.cell.value.toString()}` ? (
                <span className="tag is-info is-light">Imported</span>
              ) : (
                "Not Imported"
              );
            },
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
                !isNil(props.cell.value.comicvine) && (
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
                !isNil(props.cell.value) && (
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

  columns[0].columns[0].Cell.propTypes = {
    value: PropTypes.object.isRequired,
  };
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    pageOptions,
    pageCount,
    state: { pageIndex, pageSize },
    gotoPage,
    previousPage,
    nextPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
  } = useTable(
    { columns, data, initialState: { pageIndex: 0 } },
    usePagination,
  );

  const comicBookLibraryItems = React.useMemo(() => {});

  return (
    <section className="container">
      <div className="section">
        <h1 className="title">Library</h1>
        <div className="columns">
          <div className="column library">
            <table
              {...getTableProps()}
              className="table is-narrow is-hoverable"
            >
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
                    <tr key={idx} {...row.getRowProps()}>
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

            <nav
              className="pagination"
              role="navigation"
              aria-label="pagination"
            >
              <div>
                Page {pageIndex + 1} of {pageOptions.length}
              </div>
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

              <div className="field has-addons">
                <p className="control">
                  <button
                    className="button"
                    onClick={() => gotoPage(0)}
                    disabled={!canPreviousPage}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                </p>
                <p className="control">
                  <button
                    className="button"
                    onClick={() => gotoPage(pageCount - 1)}
                    disabled={!canNextPage}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </p>
              </div>
              <span>
                Go to page:
                <input
                  type="number"
                  className="input"
                  defaultValue={pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    gotoPage(page);
                  }}
                  style={{ width: "100px" }}
                />
              </span>

              <div
                className={
                  "dropdown " + (isPageSizeDropdownCollapsed ? "is-active" : "")
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
      </div>
    </section>
  );
};

export default Library;
