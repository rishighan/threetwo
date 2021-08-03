import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactElement,
} from "react";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { useTable } from "react-table";

import { useDispatch, useSelector } from "react-redux";

interface IComicBookLibraryProps {
  matches: unknown;
}

export const Library = ({}: IComicBookLibraryProps): ReactElement => {
  const data = useSelector(
    (state: RootState) => state.fileOps.recentComics.docs,
  );
  const columns = useMemo(
    () => [
      {
        Header: "Comic Metadata",
        columns: [
          {
            Header: "Name",
            accessor: "rawFileDetails",
            Cell: (props) => {
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
                    <div className="card-content">
                        <p>{props.cell.value.name}</p>
                        {props.cell.value.containedIn}
                    </div>
                  </div>
                </div>
                </div>
              );
            },
          },
          {
            Header: "Import Status",
            accessor: "",
          },
        ],
      },
    ],
    [],
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const comicBookLibraryItems = React.useMemo(() => {});

  return (
    <section className="container">
      <div className="section">
        <h1 className="title">Library</h1>
        <div className="columns">
          <div className="column">
            <table {...getTableProps()}>
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
                {rows.map((row, idx) => {
                  prepareRow(row);
                  return (
                    <tr key={idx} {...row.getRowProps()}>
                      {row.cells.map((cell, idx) => {
                        console.log(cell);
                        return (
                          <td key={idx} {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Library;
