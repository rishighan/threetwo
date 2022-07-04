import React, { ReactElement, useState } from "react";
import PropTypes from "prop-types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export const T2Table = (tableOptions): ReactElement => {
  const { rowData, columns, paginationHandlers, totalPages, rowClickHandler } =
    tableOptions;
  const [isPageSizeDropdownCollapsed, collapsePageSizeDropdown] =
    useState(false);
  const togglePageSizeDropdown = () =>
    collapsePageSizeDropdown(!isPageSizeDropdownCollapsed);
  console.log(rowData);
    const table = useReactTable({
      data: rowData,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })
  
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
