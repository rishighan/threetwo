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
          Page {pageIndex} of {Math.ceil(totalPages / pageSize)}
          <p>{totalPages} comics in all</p>
          {/* Prev/Next buttons */}
          <div className="inline-flex flex-row mt-4 mb-4">
            <button
              onClick={() => goToPreviousPage()}
              disabled={pageIndex === 1}
              className="bg-slate-500 rounded-l border-slate-600 border-r pt-2 px-2"
            >
              <i className="icon-[solar--arrow-left-linear] h-6 w-6"></i>
            </button>
            <button
              className="bg-slate-500 rounded-r pt-2 px-2"
              onClick={() => goToNextPage()}
              disabled={pageIndex > Math.floor(totalPages / pageSize)}
            >
              <i className="icon-[solar--arrow-right-linear] h-6 w-6"></i>
            </button>
          </div>
          <button className="button">
            <span className="icon is-small">
              <i className="fa-solid fa-list"></i>
            </span>
          </button>
          <button className="button">
            <Link to="/library-grid">
              <span className="icon is-small">
                <i className="fa-solid fa-image"></i>
              </span>
            </Link>
          </button>
        </nav>
      </div>
      <table className="table-auto border-collapse overflow-auto">
        <thead className="sticky top-0 bg-slate-200 dark:bg-slate-500">
          {table.getHeaderGroups().map((headerGroup, idx) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="px-3 py-3"
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
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id} className="align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
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
