import React, { ReactElement, useState } from "react";
import PropTypes from "prop-types";
import { useTable, usePagination, useFlexLayout } from "react-table";

export const T2Table = (tableOptions): ReactElement => {
  const { rowData, columns, paginationHandlers, totalPages, rowClickHandler } =
    tableOptions;
  const [isPageSizeDropdownCollapsed, collapsePageSizeDropdown] =
    useState(false);
  const togglePageSizeDropdown = () =>
    collapsePageSizeDropdown(!isPageSizeDropdownCollapsed);
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
      data: rowData,
      manualPagination: true,
      initialState: {
        pageIndex: 1,
        pageSize: 25,
      },
      pageCount: totalPages,
    },
    usePagination,
    // useFlexLayout,
  );
  return (
    <>
      <table {...getTableProps()} className="table is-hoverable">
        <thead>
          {headerGroups.map((headerGroup, idx) => (
            <tr key={idx} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, idx) => (
                <th
                  key={idx}
                  {...column.getHeaderProps({
                    style: { minWidth: column.minWidth, width: column.width },
                  })}
                >
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
                onClick={() => rowClickHandler(row)}
              >
                {row.cells.map((cell, idx) => {
                  return (
                    <td
                      key={idx}
                      {...cell.getCellProps({
                        style: {
                          minWidth: cell.column.minWidth,
                          width: cell.column.width,
                        },
                      })}
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

      {/* pagination control */}
      <nav className="pagination" role="navigation" aria-label="pagination">
        {/* x of total indicator */}
        <div>
          Page {pageIndex} of {Math.ceil(pageCount / pageSize)}
          (Total resources: {pageCount})
        </div>

        {/* previous page and next page controls */}
        <div className="field has-addons">
          <p className="control">
            <button
              className="button"
              onClick={() => {
                previousPage();
                return paginationHandlers.previousPage(pageIndex, pageSize);
              }}
              disabled={!canPreviousPage}
            >
              Previous Page
            </button>
          </p>
          <p className="control">
            <button
              className="button"
              onClick={() => {
                nextPage();
                return paginationHandlers.nextPage(pageIndex, pageSize);
              }}
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
              onClick={() => gotoPage(Math.ceil(pageCount / pageSize))}
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
        {/* <div
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
        </div> */}
      </nav>
    </>
  );
};

T2Table.propTypes = {
  rowData: PropTypes.array,
  totalPages: PropTypes.number,
  columns: PropTypes.array,
  paginationHandlers: PropTypes.shape({
    nextPage: PropTypes.func,
    previousPage: PropTypes.func,
  }),
  rowClickHandler: PropTypes.func,
};
export default T2Table;
