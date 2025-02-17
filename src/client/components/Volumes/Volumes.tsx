import React, { ReactElement, useEffect, useMemo } from "react";
import { searchIssue } from "../../actions/fileops.actions";
import Card from "../shared/Carda";
import T2Table from "../shared/T2Table";
import ellipsize from "ellipsize";
import { convert } from "html-to-text";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SEARCH_SERVICE_BASE_URI } from "../../constants/endpoints";

export const Volumes = (props): ReactElement => {
  // const volumes = useSelector((state: RootState) => state.fileOps.volumes);
  const {
    data: volumes,
    isSuccess,
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
          type: "volumes",
          trigger: "volumesPage",
        },
      }),
    queryKey: ["volumes"],
  });
  console.log(volumes);
  const columnData = useMemo(
    (): any => [
      {
        header: "Volume Details",
        id: "volumeDetails",
        minWidth: 450,
        accessorFn: (row) => row,
        cell: (row): any => {
          const comicObject = row.getValue();
          const {
            _source: { sourcedMetadata },
          } = comicObject;
          console.log("jaggu", row.getValue());
          return (
            <div className="flex flex-row gap-3 mt-5">
              <Link to={`/volume/details/${comicObject._id}`}>
                <Card
                  imageUrl={
                    sourcedMetadata.comicvine.volumeInformation.image.small_url
                  }
                  orientation={"cover-only"}
                  hasDetails={false}
                />
              </Link>
              <div className="dark:bg-[#647587] bg-slate-200 rounded-lg w-3/4 h-fit p-3">
                <div className="text-xl mb-1 w-fit">
                  {sourcedMetadata.comicvine.volumeInformation.name}
                </div>
                <p>
                  {ellipsize(
                    convert(
                      sourcedMetadata.comicvine.volumeInformation.description,
                      {
                        baseElements: {
                          selectors: ["p"],
                        },
                      },
                    ),
                    180,
                  )}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: "Other Details",
        columns: [
          {
            header: "Downloads",
            accessorKey: "_source.acquisition.directconnect",
            align: "right",
            cell: (props) => {
              const row = props.getValue();
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  {row.length > 0 ? (
                    <span className="tag is-warning">{row.length}</span>
                  ) : null}
                </div>
              );
            },
          },
          {
            header: "Publisher",
            accessorKey: "_source.sourcedMetadata.comicvine.volumeInformation",
            cell: (props): any => {
              const row = props.getValue();
              return <div className="mt-5 text-md">{row.publisher.name}</div>;
            },
          },
          {
            header: "Issue Count",
            accessorKey:
              "_source.sourcedMetadata.comicvine.volumeInformation.count_of_issues",
            cell: (props): any => {
              const row = props.getValue();
              return (
                <div className="mt-5">
                  {/* issue count */}
                  <span className="inline-flex items-center bg-slate-50 text-slate-800 font-medium px-2.5 py-0.5 rounded-md dark:text-slate-600 dark:bg-slate-400">
                    <span className="pr-1 pt-1">
                      <i className="icon-[solar--documents-minimalistic-bold-duotone] w-6 h-6"></i>
                    </span>

                    <span className="text-lg text-slate-500 dark:text-slate-900">
                      {row}
                    </span>
                  </span>
                </div>
              );
            },
          },
        ],
      },
    ],
    [],
  );
  return (
    <div>
      <section className="">
        <header className="bg-slate-200 dark:bg-slate-500">
          <div className="mx-auto max-w-screen-xl px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Volumes
                </h1>

                <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                  Browse your collection of volumes.
                </p>
              </div>
            </div>
          </div>
        </header>
        {isSuccess ? (
          <div>
            <div className="library">
              <T2Table
                sourceData={volumes?.data.hits.hits}
                totalPages={volumes?.data.hits.hits.length}
                paginationHandlers={{
                  nextPage: () => {},
                  previousPage: () => {},
                }}
                rowClickHandler={() => {}}
                columns={columnData}
              />
            </div>
          </div>
        ) : null}
        {isError ? (
          <div>An error was encountered while retrieving volumes</div>
        ) : null}
        {isLoading ? <>Loading...</> : null}
      </section>
    </div>
  );
};

export default Volumes;
