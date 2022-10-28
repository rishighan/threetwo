import React, { ReactElement, useState } from "react";
import PropTypes from "prop-types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";

export const T2Table = (tableOptions): ReactElement => {
  const { rowData, columns, paginationHandlers: { nextPage, previousPage }, totalPages, rowClickHandler } =
    tableOptions;
  
  const table = useReactTable({
    data: rowData,
    columns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    pageCount: totalPages,
    // getPaginationRowModel: getPaginationRowModel(),
  });

  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  return (
    <>
      <table className="table is-hoverable">
        <thead>
          {table.getHeaderGroups().map((headerGroup, idx) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row, idx) => {
            return (
              <tr
                key={row.id}
                onClick={() => rowClickHandler(row)}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* pagination control */}
      <nav className="pagination">
        {table.getState().pagination.pageIndex + 1}
        
        <div className="button" onClick={() => table.nextPage()}> Next Page </div>
        <div className="button" onClick={previousPage}> Previous Page</div>
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
