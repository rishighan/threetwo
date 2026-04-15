import React, { ReactElement } from "react";
import T2Table from "../shared/T2Table";
import MetadataPanel from "../shared/MetadataPanel";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SEARCH_SERVICE_BASE_URI } from "../../constants/endpoints";
import { CellContext } from "@tanstack/react-table";

interface WantedComicsProps {
  [key: string]: unknown;
}

interface WantedSourceData {
  _id: string;
  _source: {
    acquisition?: {
      directconnect?: {
        downloads: DownloadItem[];
      };
    };
    [key: string]: unknown;
  };
}

interface DownloadItem {
  name: string;
  [key: string]: unknown;
}

interface AcquisitionData {
  directconnect?: {
    downloads: DownloadItem[];
  };
}

export const WantedComics = (_props: WantedComicsProps): ReactElement => {
  const {
    data: wantedComics,
    isSuccess,
    isFetched,
    isError,
    isLoading,
  } = useQuery({
    queryFn: async () =>
      await axios({
        url: `${SEARCH_SERVICE_BASE_URI}/searchIssue`,
        method: "POST",
        data: {
          query: {},

          pagination: {
            size: 25,
            from: 0,
          },
          type: "wanted",
          trigger: "wantedComicsPage",
        },
      }),
    queryKey: ["wantedComics"],
    enabled: true,
  });
  const columnData = [
    {
      header: "Comic Information",
      columns: [
        {
          header: "Details",
          id: "comicDetails",
          size: 350,
          accessorFn: (data: WantedSourceData) => data,
          cell: (value: CellContext<WantedSourceData, WantedSourceData>) => {
            const row = value.getValue()._source;
            return row && <MetadataPanel data={row} />;
          },
        },
      ],
    },
    {
      header: "Download Status",
      columns: [
        {
          header: "Files",
          accessorKey: "_source.acquisition",
          cell: (props: CellContext<WantedSourceData, AcquisitionData | undefined>) => {
            const acquisition = props.getValue();
            const downloads = acquisition?.directconnect?.downloads || [];
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {downloads.length > 0 ? (
                  <span className="tag is-warning">{downloads.length}</span>
                ) : null}
              </div>
            );
          },
        },
        {
          header: "Download Details",
          id: "downloadDetails",
          accessorKey: "_source.acquisition",
          cell: (data: CellContext<WantedSourceData, AcquisitionData | undefined>) => {
            const acquisition = data.getValue();
            const downloads = acquisition?.directconnect?.downloads || [];
            return (
              <ol>
                {downloads.map((download: DownloadItem, idx: number) => {
                  return (
                    <li className="is-size-7" key={idx}>
                      {download.name}
                    </li>
                  );
                })}
              </ol>
            );
          },
        },
        {
          header: "Type",
          id: "dcc",
        },
      ],
    },
  ];

  /**
   * Pagination control that fetches the next x (pageSize) items
   * based on the y (pageIndex) offset from the Elasticsearch index
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns void
   *
   **/
  // const nextPage = useCallback((pageIndex: number, pageSize: number) => {
  //   dispatch(
  //     searchIssue(
  //       {
  //         query: {},
  //       },
  //       {
  //         pagination: {
  //           size: pageSize,
  //           from: pageSize * pageIndex + 1,
  //         },
  //         type: "wanted",
  //         trigger: "wantedComicsPage",
  //       },
  //     ),
  //   );
  // }, []);

  /**
   * Pagination control that fetches the previous x (pageSize) items
   * based on the y (pageIndex) offset from the Elasticsearch index
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns void
   **/
  // const previousPage = useCallback((pageIndex: number, pageSize: number) => {
  //   let from = 0;
  //   if (pageIndex === 2) {
  //     from = (pageIndex - 1) * pageSize + 2 - 17;
  //   } else {
  //     from = (pageIndex - 1) * pageSize + 2 - 16;
  //   }
  //   dispatch(
  //     searchIssue(
  //       {
  //         query: {},
  //       },
  //       {
  //         pagination: {
  //           size: pageSize,
  //           from,
  //         },
  //         type: "wanted",
  //         trigger: "wantedComicsPage",
  //       },
  //     ),
  //   );
  // }, []);

  return (
    <div className="">
      <section className="">
        <header className="bg-slate-200 dark:bg-slate-500">
          <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Wanted Comics
                </h1>

                <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                  Browse through comics you marked as "wanted."
                </p>
              </div>
            </div>
          </div>
        </header>
        {isSuccess && wantedComics?.data.hits?.hits ? (
          <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            <div className="library">
              <T2Table
                sourceData={wantedComics?.data.hits.hits}
                totalPages={wantedComics?.data.hits.hits.length}
                columns={columnData}
                paginationHandlers={{
                  nextPage: () => {},
                  previousPage: () => {},
                }}
                // rowClickHandler={navigateToComicDetail}
              />
              {/* pagination controls */}
            </div>
          </div>
        ) : null}
        {isLoading ? <div>Loading...</div> : null}
        {isError ? (
          <div>An error occurred while retrieving the pull list.</div>
        ) : null}
      </section>
    </div>
  );
};

export default WantedComics;
