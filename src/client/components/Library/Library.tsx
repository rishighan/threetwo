import React, { useMemo, ReactElement, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { isEmpty, isNil, isUndefined } from "lodash";
import MetadataPanel from "../shared/MetadataPanel";
import T2Table from "../shared/T2Table";
import ellipsize from "ellipsize";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";

/**
 * Component that tabulates the contents of the user's ThreeTwo Library.
 *
 * @component
 * @example
 * <Library />
 */
export const Library = (): ReactElement => {
  // Default page state
  // offset: 0
  const [offset, setOffset] = useState(0);

  // Method to fetch paginated issues
  const fetchIssues = async (searchQuery, offset, type) => {
    let pagination = {
      size: 15,
      from: offset,
    };
    return await axios({
      method: "POST",
      url: "http://localhost:3000/api/search/searchIssue",
      data: {
        searchQuery,
        pagination,
        type,
      },
    });
  };

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["comics", offset],
    queryFn: () => fetchIssues({}, offset, "all"),
    placeholderData: keepPreviousData,
  });

  const searchResults = data?.data;

  // Programmatically navigate to comic detail
  const navigate = useNavigate();
  const navigateToComicDetail = (row) => {
    navigate(`/comic/details/${row.original._id}`);
  };

  const ComicInfoXML = (value) => {
    return value.data ? (
      <dl className="flex flex-col text-md p-3 ml-4 my-3 rounded-lg dark:bg-yellow-500 bg-yellow-300 w-max">
        {/* Series Name */}
        <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
          <span className="pr-1 pt-1">
            <i className="icon-[solar--bookmark-square-minimalistic-bold-duotone] w-5 h-5"></i>
          </span>
          <span className="text-md text-slate-900 dark:text-slate-900">
            {ellipsize(value.data.series[0], 45)}
          </span>
        </span>
        <div className="flex flex-row mt-2 gap-2">
          {/* Pages */}
          <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
            <span className="pr-1 pt-1">
              <i className="icon-[solar--notebook-minimalistic-bold-duotone] w-5 h-5"></i>
            </span>
            <span className="text-md text-slate-900 dark:text-slate-900">
              Pages: {value.data.pagecount[0]}
            </span>
          </span>
          {/* Issue number */}
          <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
            <span className="pr-1 pt-1">
              <i className="icon-[solar--hashtag-outline] w-3.5 h-3.5"></i>
            </span>
            <span className="text-slate-900 dark:text-slate-900">
              {!isNil(value.data.number) && (
                <span>{parseInt(value.data.number[0], 10)}</span>
              )}
            </span>
          </span>
        </div>
      </dl>
    ) : null;
  };

  const WantedStatus = ({ value }) => {
    return !value ? <span className="tag is-info is-light">Wanted</span> : null;
  };
  const columns = useMemo(
    () => [
      {
        header: "Comic Metadata",
        footer: 1,
        columns: [
          {
            header: "File Details",
            id: "fileDetails",
            minWidth: 400,
            accessorKey: "_source",
            cell: (info) => {
              return <MetadataPanel data={info.getValue()} />;
            },
          },
          {
            header: "ComicInfo.xml",
            accessorKey: "_source.sourcedMetadata.comicInfo",
            cell: (info) =>
              !isEmpty(info.getValue()) ? (
                <ComicInfoXML data={info.getValue()} />
              ) : null,
          },
        ],
      },
      {
        header: "Additional Metadata",
        columns: [
          {
            header: "Date of Import",
            accessorKey: "_source.createdAt",
            cell: (info) => {
              return !isNil(info.getValue()) ? (
                <div className="text-xs w-max ml-3 my-3 text-slate-400">
                  <p>{format(parseISO(info.getValue()), "dd MMMM, yyyy")} </p>
                  {format(parseISO(info.getValue()), "h aaaa")}
                </div>
              ) : null;
            },
          },
          {
            header: "Downloads",
            accessorKey: "_source.acquisition",
            cell: (info) => (
              <div className="flex flex-col gap-2 ml-3 my-3">
                <span className="inline-flex items-center w-fit bg-slate-50 text-slate-800 text-xs px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                  <span className="pr-1 pt-1">
                    <i className="icon-[solar--folder-path-connect-bold-duotone] w-5 h-5"></i>
                  </span>
                  <span className="text-md text-slate-900 dark:text-slate-900">
                    DC++: {info.getValue().directconnect.downloads.length}
                  </span>
                </span>

                <span className="inline-flex w-fit items-center bg-slate-50 text-slate-800 text-xs px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                  <span className="pr-1 pt-1">
                    <i className="icon-[solar--magnet-bold-duotone] w-5 h-5"></i>
                  </span>
                  <span className="text-md text-slate-900 dark:text-slate-900">
                    Torrent: {info.getValue().torrent.downloads.length}
                  </span>
                </span>
              </div>
            ),
          },
        ],
      },
    ],
    [],
  );

  /**
   * Pagination control that fetches the next x (pageSize) items
   * based on the y (pageIndex) offset from the ThreeTwo Elasticsearch index
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns void
   *
   **/
  const nextPage = (pageIndex: number, pageSize: number) => {
    if (!isPlaceholderData) {
      setOffset(pageSize * pageIndex + 1);
    }
  };

  /**
   * Pagination control that fetches the previous x (pageSize) items
   * based on the y (pageIndex) offset from the ThreeTwo Elasticsearch index
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns void
   **/
  const previousPage = (pageIndex: number, pageSize: number) => {
    let from = 0;
    if (pageIndex === 2) {
      from = (pageIndex - 1) * pageSize + 2 - (pageSize + 2);
    } else {
      from = (pageIndex - 1) * pageSize + 2 - (pageSize + 1);
    }
    setOffset(from);
  };

  // ImportStatus.propTypes = {
  //   value: PropTypes.bool.isRequired,
  // };
  return (
    <section className="container">
      <div className="section">
        <div className="header-area">
          <h1 className="title">Library</h1>
        </div>
        {!isUndefined(searchResults?.hits) ? (
          <div>
            <div className="library">
              <T2Table
                totalPages={searchResults.hits.total.value}
                columns={columns}
                sourceData={searchResults?.hits.hits}
                rowClickHandler={navigateToComicDetail}
                paginationHandlers={{
                  nextPage,
                  previousPage,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="columns">
            <div className="column is-two-thirds">
              <article className="message is-link">
                <div className="message-body">
                  No comics were found in the library, Elasticsearch reports no
                  indices. Try importing a few comics into the library and come
                  back.
                </div>
              </article>
              {!isUndefined(searchResults?.data?.meta?.body) ? (
                <pre>
                  {JSON.stringify(
                    searchResults.data.meta.body.error.root_cause,
                    null,
                    4,
                  )}
                </pre>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Library;
