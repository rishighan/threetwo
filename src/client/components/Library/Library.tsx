import React, { useMemo, ReactElement, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isEmpty, isNil, isUndefined } from "lodash";
import MetadataPanel from "../shared/MetadataPanel";
import T2Table from "../shared/T2Table";
import SearchBar from "../Library/SearchBar";
import ellipsize from "ellipsize";
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { useGetWantedComicsQuery } from "../../graphql/generated";

import type { LibrarySearchQuery, FilterOption } from "../../types";

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All Comics" },
  { value: "missingFiles", label: "Missing Files" },
];

/**
 * Library page component. Displays a paginated, searchable table of all comics
 * in the collection, with an optional filter for comics with missing raw files.
 */
export const Library = (): ReactElement => {
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get("filter") as FilterOption) ?? "all";

  const [activeFilter, setActiveFilter] = useState<FilterOption>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<LibrarySearchQuery>({
    query: {},
    pagination: { size: 25, from: 0 },
    type: "all",
    trigger: "libraryPage",
  });

  const queryClient = useQueryClient();

  /** Fetches a page of issues from the search API. */
  const fetchIssues = async (q: LibrarySearchQuery) => {
    const { pagination, query, type } = q;
    return await axios({
      method: "POST",
      url: "http://localhost:3000/api/search/searchIssue",
      data: { query, pagination, type },
    });
  };

  const { data, isPlaceholderData } = useQuery({
    queryKey: ["comics", searchQuery],
    queryFn: () => fetchIssues(searchQuery),
    placeholderData: keepPreviousData,
    enabled: activeFilter === "all",
  });

  const { data: missingFilesData, isLoading: isMissingLoading } = useGetWantedComicsQuery(
    {
      paginationOptions: { limit: 25, page: 1 },
      predicate: { "importStatus.isRawFileMissing": true },
    },
    { enabled: activeFilter === "missingFiles" },
  );

  const { data: missingIdsData } = useGetWantedComicsQuery(
    {
      paginationOptions: { limit: 1000, page: 1 },
      predicate: { "importStatus.isRawFileMissing": true },
    },
    { enabled: activeFilter === "all" },
  );

  /** Set of comic IDs whose raw files are missing, used to highlight rows in the main table. */
  const missingIdSet = useMemo(
    () => new Set((missingIdsData?.getComicBooks?.docs ?? []).map((doc: any) => doc.id)),
    [missingIdsData],
  );

  const searchResults = data?.data;
  const navigate = useNavigate();

  const navigateToComicDetail = (row: any) => navigate(`/comic/details/${row.original._id}`);
  const navigateToMissingComicDetail = (row: any) => navigate(`/comic/details/${row.original.id}`);

  /** Triggers a search by volume name and resets pagination. */
  const searchIssues = (e: any) => {
    queryClient.invalidateQueries({ queryKey: ["comics"] });
    setSearchQuery({
      query: { volumeName: e.search },
      pagination: { size: 15, from: 0 },
      type: "volumeName",
      trigger: "libraryPage",
    });
  };

  /** Advances to the next page of results. */
  const nextPage = (pageIndex: number, pageSize: number) => {
    if (!isPlaceholderData) {
      queryClient.invalidateQueries({ queryKey: ["comics"] });
      setSearchQuery({
        query: {},
        pagination: { size: 15, from: pageSize * pageIndex + 1 },
        type: "all",
        trigger: "libraryPage",
      });
    }
  };

  /** Goes back to the previous page of results. */
  const previousPage = (pageIndex: number, pageSize: number) => {
    let from = 0;
    if (pageIndex === 2) {
      from = (pageIndex - 1) * pageSize + 2 - (pageSize + 2);
    } else {
      from = (pageIndex - 1) * pageSize + 2 - (pageSize + 1);
    }
    queryClient.invalidateQueries({ queryKey: ["comics"] });
    setSearchQuery({
      query: {},
      pagination: { size: 15, from },
      type: "all",
      trigger: "libraryPage",
    });
  };

  const ComicInfoXML = (value: any) =>
    value.data ? (
      <dl className="flex flex-col text-xs sm:text-md p-2 sm:p-3 ml-0 sm:ml-4 my-3 rounded-lg dark:bg-yellow-500 bg-yellow-300 w-full sm:w-max max-w-full">
        <span className="inline-flex items-center w-fit bg-slate-50 text-slate-800 text-xs font-medium px-1.5 sm:px-2 rounded-md dark:text-slate-900 dark:bg-slate-400 max-w-full overflow-hidden">
          <span className="pr-0.5 sm:pr-1 pt-1">
            <i className="icon-[solar--bookmark-square-minimalistic-bold-duotone] w-4 h-4 sm:w-5 sm:h-5"></i>
          </span>
          <span className="text-xs sm:text-md text-slate-900 dark:text-slate-900 truncate">
            {ellipsize(value.data.series[0], 25)}
          </span>
        </span>
        <div className="flex flex-row flex-wrap mt-1 sm:mt-2 gap-1 sm:gap-2">
          <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs px-1 sm:px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
            <span className="pr-0.5 sm:pr-1 pt-1">
              <i className="icon-[solar--notebook-minimalistic-bold-duotone] w-3.5 h-3.5 sm:w-5 sm:h-5"></i>
            </span>
            <span className="text-xs sm:text-md text-slate-900 dark:text-slate-900">
              Pages: {value.data.pagecount[0]}
            </span>
          </span>
          <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs px-1 sm:px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
            <span className="pr-0.5 sm:pr-1 pt-1">
              <i className="icon-[solar--hashtag-outline] w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
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

  const missingFilesColumns = useMemo(
    () => [
      {
        header: "Missing Files",
        columns: [
          {
            header: "Status",
            id: "missingStatus",
            cell: () => (
              <div className="flex flex-col items-center gap-1.5 px-2 py-3 min-w-[80px]">
                <i className="icon-[solar--file-corrupted-outline] w-8 h-8 text-red-500"></i>
                <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                  MISSING
                </span>
              </div>
            ),
          },
          {
            header: "Comic",
            id: "missingComic",
            minWidth: 250,
            accessorFn: (row: any) => row,
            cell: (info: any) => <MetadataPanel data={info.getValue()} />,
          },
        ],
      },
    ],
    [],
  );

  const columns = useMemo(
    () => [
      {
        header: "Comic Metadata",
        columns: [
          {
            header: "File Details",
            id: "fileDetails",
            minWidth: 250,
            accessorKey: "_source",
            cell: (info: any) => {
              const source = info.getValue();
              return (
                <MetadataPanel
                  data={source}
                  isMissing={missingIdSet.has(info.row.original._id)}
                />
              );
            },
          },
          {
            header: "ComicInfo.xml",
            accessorKey: "_source.sourcedMetadata.comicInfo",
            cell: (info: any) =>
              !isEmpty(info.getValue()) ? <ComicInfoXML data={info.getValue()} /> : null,
          },
        ],
      },
      {
        header: "Additional Metadata",
        columns: [
          {
            header: "Date of Import",
            accessorKey: "_source.createdAt",
            cell: (info: any) =>
              !isNil(info.getValue()) ? (
                <div className="text-sm w-max ml-3 my-3 text-slate-600 dark:text-slate-900">
                  <p>{format(parseISO(info.getValue()), "dd MMMM, yyyy")}</p>
                  {format(parseISO(info.getValue()), "h aaaa")}
                </div>
              ) : null,
          },
          {
            header: "Downloads",
            accessorKey: "_source.acquisition",
            cell: (info: any) => (
              <div className="flex flex-col gap-2 ml-3 my-3">
                <span className="inline-flex items-center w-fit bg-slate-50 text-slate-800 text-xs px-2 rounded-md dark:text-slate-900 dark:bg-slate-400 whitespace-nowrap">
                  <span className="pr-1 pt-1">
                    <i className="icon-[solar--folder-path-connect-bold-duotone] w-5 h-5"></i>
                  </span>
                  DC++: {info.getValue().directconnect.downloads.length}
                </span>
                <span className="inline-flex items-center w-fit bg-slate-50 text-slate-800 text-xs px-2 rounded-md dark:text-slate-900 dark:bg-slate-400 whitespace-nowrap">
                  <span className="pr-1 pt-1">
                    <i className="icon-[solar--magnet-bold-duotone] w-5 h-5"></i>
                  </span>
                  Torrent: {info.getValue().torrent.length}
                </span>
              </div>
            ),
          },
        ],
      },
    ],
    [missingIdSet],
  );

  const FilterDropdown = () => (
    <div className="relative">
      <select
        value={activeFilter}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setActiveFilter(e.target.value as FilterOption)}
        className="appearance-none h-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-3 pr-8 py-1.5 text-sm text-gray-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <i className="icon-[solar--alt-arrow-down-bold] absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400 pointer-events-none"></i>
    </div>
  );

  const isMissingFilter = activeFilter === "missingFiles";

  return (
    <section>
      <header className="bg-slate-200 dark:bg-slate-500">
        <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Library
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                Browse your comic book collection.
              </p>
            </div>
          </div>
        </div>
      </header>

      {isMissingFilter ? (
        <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          {isMissingLoading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <T2Table
              totalPages={missingFilesData?.getComicBooks?.totalDocs ?? 0}
              columns={missingFilesColumns}
              sourceData={missingFilesData?.getComicBooks?.docs ?? []}
              rowClickHandler={navigateToMissingComicDetail}
              getRowClassName={() => "bg-card-missing/40 hover:bg-card-missing/20"}
              paginationHandlers={{ nextPage: () => {}, previousPage: () => {} }}
            >
              <FilterDropdown />
            </T2Table>
          )}
        </div>
      ) : !isUndefined(searchResults?.hits) ? (
        <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          <T2Table
            totalPages={searchResults.hits.total.value}
            columns={columns}
            sourceData={searchResults?.hits.hits}
            rowClickHandler={navigateToComicDetail}
            getRowClassName={(row) =>
              missingIdSet.has(row.original._id)
                ? "bg-card-missing/40 hover:bg-card-missing/20"
                : "hover:bg-slate-100/30 dark:hover:bg-slate-700/20"
            }
            paginationHandlers={{ nextPage, previousPage }}
          >
            <div className="flex items-center gap-2">
              <FilterDropdown />
              <SearchBar searchHandler={(e: any) => searchIssues(e)} />
            </div>
          </T2Table>
        </div>
      ) : (
        <div className="mx-auto max-w-screen-xl mt-5">
          <article
            role="alert"
            className="rounded-lg max-w-screen-md border-s-4 border-yellow-500 bg-yellow-50 p-4 dark:border-s-4 dark:border-yellow-600 dark:bg-yellow-300 dark:text-slate-600"
          >
            <div>
              <p>
                No comics were found in the library, Elasticsearch reports no indices. Try
                importing a few comics into the library and come back.
              </p>
            </div>
          </article>
          <FilterDropdown />
        </div>
      )}
    </section>
  );
};

export default Library;
