import React, { useState, useEffect, useMemo, ReactElement } from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { useTable, usePagination } from "react-table";
import prettyBytes from "pretty-bytes";
import styled from "styled-components";
import ellipsize from "ellipsize";
import { useDispatch, useSelector } from "react-redux";
import { Form, Field } from "react-final-form";
import { getComicBooks } from "../actions/fileops.actions";
import { isNil } from "lodash";
import { IMPORT_SERVICE_HOST } from "../constants/endpoints";
import { Link } from "react-router-dom";

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
  const history = useHistory();
  const navigateToComicDetail = (id) => {
    history.push(`/comic/details/${id}`);
  };
  // raw file details
  const RawFileDetails = ({ value }) => {
    if (!isNil(value.path)) {
      const encodedFilePath = encodeURI(
        `${IMPORT_SERVICE_HOST}` + removeLeadingPeriod(value.path),
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
                  {ellipsize(value.name, 18)}
                </li>
                <li>
                  <div className="control">
                    <div className="tags has-addons">
                      <span className="tag is-primary is-light">
                        {value.extension}
                      </span>
                      <span className="tag is-info is-light">
                        {prettyBytes(value.fileSize)}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    } else if (!isNil(value.comicvine)) {
      return (
        <div className="card-container">
          <div className="card">
            <div className="is-horizontal">
              <div className="card-image">
                <figure>
                  <img
                    className="image"
                    src={value.comicvine.image.thumb_url}
                  />
                </figure>
              </div>
              <ul className="card-content">
                <li className="name has-text-weight-medium">
                  {ellipsize(value.name, 18)}
                </li>
                <li>
                  <div className="control">
                    <div className="tags has-addons">
                      <span className="tag is-primary is-light">
                        ComicVine ID
                      </span>
                      <span className="tag is-info is-light">
                        {value.comicvine.id}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
  };
  const ImportStatus = ({ value }) => {
    return value ? (
      <span className="tag is-info is-light">Imported</span>
    ) : (
      "Not Imported"
    );
  };

  const foo = () => {};
  const SearchBar = () => {
    return (
      <div className="box columns sticky">
        <Form
          onSubmit={foo}
          initialValues={{}}
          render={({ handleSubmit, form, submitting, pristine, values }) => (
            <div className="column is-three-quarters search">
              <label>Search</label>
              <Field name="search">
                {({ input, meta }) => {
                  return (
                    <input
                      {...input}
                      className="input main-search-bar is-medium"
                      placeholder="Type an issue/volume name"
                    />
                  );
                }}
              </Field>
            </div>
          )}
        />
        <div className="column one-fifth">
          <div className="field has-addons">
            <p className="control">
              <button className="button">
                <span className="icon is-small">
                  <i className="fa-solid fa-list"></i>
                </span>
              </button>
            </p>
            <p className="control">
              <button className="button">
                <Link to="/library-grid">
                  <span className="icon is-small">
                    <i className="fa-solid fa-image"></i>
                  </span>
                </Link>
              </button>
            </p>
          </div>
        </div>
      </div>
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
              !isNil(row.rawFileDetails)
                ? row.rawFileDetails
                : row.sourcedMetadata,
            Cell: RawFileDetails,
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

  RawFileDetails.propTypes = {
    value: PropTypes.shape({
      name: PropTypes.string,
      path: PropTypes.string,
      fileSize: PropTypes.number,
      extension: PropTypes.string,
    }),
  };

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

        <SearchBar />
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
