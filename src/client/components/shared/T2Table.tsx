import React, { ReactElement, ReactNode, useMemo, useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";

/** Props for {@link T2Table}. */
interface T2TableProps<TData> {
  /** Row data to render. */
  sourceData?: TData[];
  /** Total number of records across all pages, used for pagination display. */
  totalPages?: number;
  /** Column definitions (TanStack Table {@link ColumnDef} array). */
  columns?: ColumnDef<TData>[];
  /** Callbacks for navigating between pages. */
  paginationHandlers?: {
    nextPage?(pageIndex: number, pageSize: number): void;
    previousPage?(pageIndex: number, pageSize: number): void;
  };
  /** Called with the TanStack row object when a row is clicked. */
  rowClickHandler?(row: Row<TData>): void;
  /** Returns additional CSS classes for a given row (e.g. for highlight states). */
  getRowClassName?(row: Row<TData>): string;
  /** Optional slot rendered in the toolbar area (e.g. a search input). */
  children?: ReactNode;
}

/**
 * A paginated data table with a two-row sticky header.
 *
 * Header stickiness is detected via {@link IntersectionObserver} on a sentinel
 * element placed immediately before the table. The second header row's `top`
 * offset is measured at mount time so both rows stay flush regardless of font
 * size or padding changes.
 */
export const T2Table = <TData,>({
  sourceData = [],
  columns = [],
  paginationHandlers: { nextPage, previousPage } = {},
  totalPages = 0,
  rowClickHandler,
  getRowClassName,
  children,
}: T2TableProps<TData>): ReactElement => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firstHeaderRowRef = useRef<HTMLTableRowElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [firstRowHeight, setFirstRowHeight] = useState(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (firstHeaderRowRef.current)
      setFirstRowHeight(firstHeaderRowRef.current.getBoundingClientRect().height);
  }, []);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 15,
  });

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  /** Advances to the next page and notifies the parent. */
  const goToNextPage = () => {
    setPagination({ pageIndex: pageIndex + 1, pageSize });
    nextPage?.(pageIndex, pageSize);
  };

  /** Goes back one page and notifies the parent. */
  const goToPreviousPage = () => {
    setPagination({ pageIndex: pageIndex - 1, pageSize });
    previousPage?.(pageIndex, pageSize);
  };

  const table = useReactTable({
    data: sourceData,
    columns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    pageCount: sourceData.length ?? -1,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  return (
    <div className="container max-w-fit">
      <div className="flex flex-row gap-2 justify-between mt-6 mb-4">
        {children}

        <div className="text-sm text-gray-800 dark:text-slate-200">
          <div className="mb-1">
            Page {pageIndex} of {Math.ceil(totalPages / pageSize)}
          </div>
          <p className="text-xs text-gray-600 dark:text-slate-400">
            {totalPages} comics in all
          </p>
          <div className="inline-flex flex-row mt-3">
            <button
              onClick={goToPreviousPage}
              disabled={pageIndex === 1}
              className="dark:bg-slate-400 bg-gray-300 rounded-l px-2 py-1 border-r border-slate-600"
            >
              <i className="icon-[solar--arrow-left-linear] h-5 w-5" />
            </button>
            <button
              onClick={goToNextPage}
              disabled={pageIndex > Math.floor(totalPages / pageSize)}
              className="dark:bg-slate-400 bg-gray-300 rounded-r px-2 py-1"
            >
              <i className="icon-[solar--arrow-right-linear] h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={sentinelRef} />
      <table className="table-auto w-full text-sm text-gray-900 dark:text-slate-100">
        <thead>
          {table.getHeaderGroups().map((headerGroup, groupIndex) => (
            <tr key={headerGroup.id} ref={groupIndex === 0 ? firstHeaderRowRef : undefined}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={groupIndex === 1 ? { top: firstRowHeight } : undefined}
                  className={[
                    'sticky z-10 px-3 py-2 text-[11px] font-semibold tracking-wide uppercase text-left',
                    'text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900',
                    groupIndex === 0
                      ? `top-0 ${isSticky ? 'first:rounded-tl-xl last:rounded-tr-xl' : ''}`
                      : `border-b-2 border-gray-200 dark:border-slate-600 shadow-md ${isSticky ? 'first:rounded-bl-xl last:rounded-br-xl' : ''}`,
                  ].join(' ')}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => rowClickHandler?.(row)}
              className={`border-b border-gray-200 dark:border-slate-700 transition-colors cursor-pointer ${getRowClassName ? getRowClassName(row) : "hover:bg-slate-100/30 dark:hover:bg-slate-700/20"}`}
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
