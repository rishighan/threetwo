import React, { ReactElement, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";

interface T2TableProps {
  sourceData?: unknown[];
  totalPages?: number;
  columns?: unknown[];
  paginationHandlers?: {
    nextPage?(...args: unknown[]): unknown;
    previousPage?(...args: unknown[]): unknown;
  };
  rowClickHandler?(...args: unknown[]): unknown;
  children?: any;
}

export const T2Table = (tableOptions: T2TableProps): ReactElement => {
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
    <div className="container max-w-fit mx-14">
      <div>
        <div className="flex flex-row gap-2 justify-between mt-6 mb-4">
          {/* Search bar */}
          {tableOptions.children}

          {/* Pagination controls */}
          <div className="text-sm text-gray-800 dark:text-slate-200">
            <div className="mb-1">
              Page {pageIndex} of {Math.ceil(totalPages / pageSize)}
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400">
              {totalPages} comics in all
            </p>
            <div className="inline-flex flex-row mt-3">
              <button
                onClick={() => goToPreviousPage()}
                disabled={pageIndex === 1}
                className="dark:bg-slate-400 bg-gray-300 rounded-l px-2 py-1 border-r border-slate-600"
              >
                <i className="icon-[solar--arrow-left-linear] h-5 w-5"></i>
              </button>
              <button
                className="dark:bg-slate-400 bg-gray-300 rounded-r px-2 py-1"
                onClick={() => goToNextPage()}
                disabled={pageIndex > Math.floor(totalPages / pageSize)}
              >
                <i className="icon-[solar--arrow-right-linear] h-5 w-5"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <table className="table-auto w-full text-sm text-gray-900 dark:text-slate-100">
        <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
          {table.getHeaderGroups().map((headerGroup, groupIndex) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="px-3 py-2 text-[11px] font-semibold tracking-wide uppercase text-left text-gray-500 dark:text-slate-400 border-b border-gray-300 dark:border-slate-700"
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
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              onClick={() => rowClickHandler(row)}
              className="border-b border-gray-200 dark:border-slate-700 hover:bg-slate-100/30 dark:hover:bg-slate-700/20 transition-colors cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default T2Table;
