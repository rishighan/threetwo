import React, { useState, useEffect, useMemo, ReactElement } from "react";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { useTable } from "react-table";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";
import { useDispatch, useSelector } from "react-redux";
import { getComicBooks } from "../actions/fileops.actions";

interface IComicBookLibraryProps {
  matches?: unknown;
}

export const Library = ({}: IComicBookLibraryProps): ReactElement => {
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      getComicBooks({
        paginationOptions: {
          page: 0,
          limit: 15,
        },
      }),
    );
  }, [page, dispatch]);

  const data = useSelector(
    (state: RootState) => state.fileOps.recentComics.docs,
  );

  const columns = useMemo(
    () => [
      {
        Header: "Comic Metadata",
        columns: [
          {
            Header: "File Details",
            accessor: "rawFileDetails",
            // eslint-disable-next-line react/display-name
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
                      <ul className="card-content">
                        <li className="name has-text-weight-medium">
                          {ellipsize(props.cell.value.name, 18)}
                        </li>
                        <li>
                          <div className="control">
                            <div className="tags has-addons">
                              <span className="tag is-primary is-light">
                                {props.cell.value.extension}
                              </span>
                              <span className="tag is-info is-light">
                                {prettyBytes(props.cell.value.fileSize)}
                              </span>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            Header: "Import Status",
            accessor: "importStatus.isImported",
            Cell: (props) =>
              `${props.cell.value.toString()}` ? (
                <span className="tag is-info is-light">Imported</span>
              ) : (
                "Not Imported"
              ),
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
          <div className="column library">
            <table
              {...getTableProps()}
              className="table is-narrow is-hoverable"
            >
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
