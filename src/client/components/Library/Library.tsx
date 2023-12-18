import React, { useMemo, ReactElement, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { isEmpty, isNil, isUndefined } from "lodash";
import MetadataPanel from "../shared/MetadataPanel";
import T2Table from "../shared/T2Table";
import ellipsize from "ellipsize";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";

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
      <dl className="flex flex-col text-md p-4 mx-4 my-3 rounded-lg bg-amber-400 w-max">
        <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
          <span className="pr-1 pt-1">
            <i className="icon-[solar--bookmark-square-minimalistic-bold-duotone] w-5 h-5"></i>
          </span>
          <span className="text-md text-slate-900 dark:text-slate-900">
            {ellipsize(value.data.series[0], 45)}
          </span>
        </span>
        <div className="field is-grouped is-grouped-multiline">
          <div className="control">
            <span className="tags has-addons is-size-7  mt-2">
              <span className="tag">Pages</span>
              <span className="tag is-info is-light has-text-weight-bold">
                {value.data.pagecount[0]}
              </span>
            </span>
          </div>

          <div className="control">
            <span className="tags has-addons is-size-7 mt-2">
              <span className="tag">Issue</span>
              {!isNil(value.data.number) && (
                <span className="tag has-text-weight-bold is-success is-light">
                  {parseInt(value.data.number[0], 10)}
                </span>
              )}
            </span>
          </div>
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
              ) : (
                <span className="text-sm p-4">No ComicInfo.xml</span>
              ),
          },
        ],
      },
      {
        header: "Additional Metadata",
        columns: [
          {
            header: "Publisher",
            accessorKey: "_source.sourcedMetadata.comicvine.volumeInformation",
            cell: (info) => {
              return !isNil(info.getValue()) ? (
                <h6>{info.getValue().publisher.name}</h6>
              ) : (
                "Chimin"
              );
            },
          },
          {
            header: "Something",
            accessorKey: "_source.acquisition.source.wanted",
            cell: (info) => {
              !isUndefined(info.getValue()) ? (
                <WantedStatus value={info.getValue().toString()} />
              ) : (
                "Nothing"
              );
            },
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
