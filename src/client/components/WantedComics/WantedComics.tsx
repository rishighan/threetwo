import React from "react";
import { useQuery } from "@tanstack/react-query";
import { gql, GraphQLClient } from "graphql-request";
import T2Table from "../shared/T2Table";
import MetadataPanel from "../shared/MetadataPanel";

/**
 * GraphQL client for interfacing with Moleculer Apollo server.
 */
const client = new GraphQLClient("http://localhost:3000/graphql");

/**
 * GraphQL query to fetch wanted comics.
 */
const WANTED_COMICS_QUERY = gql`
  query {
    wantedComics(limit: 25, offset: 0) {
      total
      comics
    }
  }
`;

/**
 * Shape of an individual comic returned by the backend.
 */
type Comic = {
  _id: string;
  sourcedMetadata?: {
    comicvine?: {
      name?: string;
      start_year?: string;
      publisher?: {
        name?: string;
      };
    };
  };
  acquisition?: {
    directconnect?: {
      downloads?: Array<{
        name: string;
      }>;
    };
  };
};

/**
 * Shape of the GraphQL response returned for wanted comics.
 */
type WantedComicsResponse = {
  wantedComics: {
    total: number;
    comics: Comic[];
  };
};

/**
 * React component rendering the "Wanted Comics" table using T2Table.
 * Fetches data from GraphQL backend via graphql-request + TanStack Query.
 *
 * @component
 * @returns {JSX.Element} React component
 */
const WantedComics = (): JSX.Element => {
  const { data, isLoading, isError, isSuccess, error } = useQuery<
    WantedComicsResponse["wantedComics"]
  >({
    queryKey: ["wantedComics"],
    queryFn: async () => {
      const res = await client.request<WantedComicsResponse>(
        WANTED_COMICS_QUERY,
      );

      if (!res?.wantedComics?.comics) {
        throw new Error("No comics returned");
      }

      return res.wantedComics;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const columnData = [
    {
      header: "Comic Information",
      columns: [
        {
          header: "Details",
          id: "comicDetails",
          minWidth: 350,
          accessorFn: (data: Comic) => data,
          cell: (value: any) => {
            const row = value.getValue();
            console.log("Comic row data:", row);
            return row ? <MetadataPanel data={row} /> : null;
          },
        },
      ],
    },
    {
      header: "Download Status",
      columns: [
        {
          header: "Files",
          align: "right",
          accessorFn: (row: Comic) =>
            row?.acquisition?.directconnect?.downloads || [],
          cell: (props: any) => {
            const downloads = props.getValue();
            return downloads?.length > 0 ? (
              <span className="tag is-warning">{downloads.length}</span>
            ) : null;
          },
        },
        {
          header: "Download Details",
          id: "downloadDetails",
          accessorFn: (row: Comic) =>
            row?.acquisition?.directconnect?.downloads || [],
          cell: (data: any) => (
            <ol>
              {data.getValue()?.map((download: any, idx: number) => (
                <li className="is-size-7" key={idx}>
                  {download.name}
                </li>
              ))}
            </ol>
          ),
        },
      ],
    },
  ];

  return (
    <section>
      <header className="bg-slate-200 dark:bg-slate-500">
        <div className="mx-auto max-w-screen-xl px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
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

      {isLoading && (
        <div className="animate-pulse p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-24 bg-slate-300 dark:bg-slate-600 rounded-md"
            />
          ))}
        </div>
      )}
      {isError && <div>Error fetching wanted comics. {error?.message}</div>}
      {isSuccess && data?.comics?.length > 0 ? (
        <T2Table
          sourceData={data.comics}
          totalPages={data.comics.length}
          columns={columnData}
          paginationHandlers={{}}
        />
      ) : isSuccess ? (
        <div>No comics found.</div>
      ) : null}
    </section>
  );
};

export default WantedComics;
