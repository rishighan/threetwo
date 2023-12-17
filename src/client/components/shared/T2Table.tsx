import React, { ReactElement, useMemo, useState } from "react";
import PropTypes from "prop-types";
import SearchBar from "../Library/SearchBar";
import { Link } from "react-router-dom";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";

export const T2Table = (tableOptions): ReactElement => {
  const {
    sourceData,
    columns,
    paginationHandlers: { nextPage, previousPage },
    totalPages,
    rowClickHandler,
  } = tableOptions;

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 15,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  /**
   * Pagination control to move forward one page
   * @returns void
   */
  const goToNextPage = () => {
    setPagination({
      pageIndex: pageIndex + 1,
      pageSize,
    });
    nextPage(pageIndex, pageSize);
  };

  /**
   * Pagination control to move backward one page
   * @returns void
   **/
  const goToPreviousPage = () => {
    setPagination({
      pageIndex: pageIndex - 1,
      pageSize,
    });
    previousPage(pageIndex, pageSize);
  };

  const table = useReactTable({
    data: sourceData,
    columns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    pageCount: sourceData.length ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <>
      <div>
        {/* Search bar */}
        <div className="column is-half">
          <SearchBar />
        </div>
        {/* pagination controls */}
        <nav className="pagination columns">
          <div className="mr-4 has-text-weight-semibold has-text-left">
            <p className="is-size-5">
              Page {pageIndex} of {Math.ceil(totalPages / pageSize)}
            </p>
            <p>{totalPages} comics in all</p>
          </div>
          <div className="field has-addons">
            <div className="control">
              <button
                className="button"
                onClick={() => goToPreviousPage()}
                disabled={pageIndex === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
            <div className="control">
              <button
                className="button"
                onClick={() => goToNextPage()}
                disabled={pageIndex > Math.floor(totalPages / pageSize)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="field has-addons ml-5">
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
        </nav>
      </div>
      <table className="table-auto">
        <thead>
          {table.getHeaderGroups().map((headerGroup, idx) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="sticky top-0 px-6 py-3"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row, idx) => {
            return (
              <tr key={row.id} onClick={() => rowClickHandler(row)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

T2Table.propTypes = {
  sourceData: PropTypes.array,
  totalPages: PropTypes.number,
  columns: PropTypes.array,
  paginationHandlers: PropTypes.shape({
    nextPage: PropTypes.func,
    previousPage: PropTypes.func,
  }),
  rowClickHandler: PropTypes.func,
};
export default T2Table;
