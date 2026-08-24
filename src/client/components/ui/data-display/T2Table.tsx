import { ReactElement, useMemo, useState, useRef, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import type { T2TableProps } from "../../../types";

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
  const tableRef = useRef<HTMLTableElement>(null);
  const firstHeaderRowRef = useRef<HTMLTableRowElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [tableRect, setTableRect] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [columnWidths, setColumnWidths] = useState<Map<string, number>>(new Map());

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

  useEffect(() => {
    const updateTableRect = () => {
      if (tableRef.current) {
        const rect = tableRef.current.getBoundingClientRect();
        setTableRect({ left: rect.left + window.scrollX, width: rect.width });

        // Measure column widths from the original table header cells
        const headerCells = tableRef.current.querySelectorAll('thead th');
        const widths = new Map<string, number>();
        headerCells.forEach((cell) => {
          const id = cell.getAttribute('data-column-id');
          if (id) {
            widths.set(id, cell.getBoundingClientRect().width);
          }
        });
        setColumnWidths(widths);
      }
    };
    updateTableRect();
    window.addEventListener('resize', updateTableRect);
    window.addEventListener('scroll', updateTableRect);
    return () => {
      window.removeEventListener('resize', updateTableRect);
      window.removeEventListener('scroll', updateTableRect);
    };
  }, [sourceData]);

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
      {isSticky && (
        <div
          className="fixed top-0 z-20"
          style={{ left: tableRect.left, width: tableRect.width }}
        >
          <table className="table-fixed w-full text-sm text-gray-900 dark:text-slate-100">
            <thead>
              {table.getHeaderGroups().map((headerGroup, groupIndex) => (
                <tr key={`sticky-${headerGroup.id}`}>
                  {headerGroup.headers.map((header) => {
                    const columnId = `${groupIndex}-${header.id}`;
                    const width = columnWidths.get(columnId);
                    return (
                      <th
                        key={`sticky-${header.id}`}
                        colSpan={header.colSpan}
                        style={width ? { width } : undefined}
                        className={[
                          'px-3 py-2 text-[11px] font-semibold tracking-wide uppercase text-left',
                          'text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900',
                          groupIndex === 0
                            ? 'first:rounded-tl-xl last:rounded-tr-xl'
                            : 'border-b-2 border-gray-200 dark:border-slate-600 first:rounded-bl-xl last:rounded-br-xl',
                        ].join(' ')}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
          </table>
        </div>
      )}
      <table ref={tableRef} className="table-auto w-full text-sm text-gray-900 dark:text-slate-100">
        <thead>
          {table.getHeaderGroups().map((headerGroup, groupIndex) => (
            <tr key={headerGroup.id} ref={groupIndex === 0 ? firstHeaderRowRef : undefined}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  data-column-id={`${groupIndex}-${header.id}`}
                  className={[
                    'px-3 py-2 text-[11px] font-semibold tracking-wide uppercase text-left',
                    'text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900',
                    groupIndex === 0
                      ? 'first:rounded-tl-xl last:rounded-tr-xl'
                      : 'border-b-2 border-gray-200 dark:border-slate-600',
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
