import React, { ReactElement, useMemo } from "react";
import Card from "../shared/Carda";
import T2Table from "../shared/T2Table";
import ellipsize from "ellipsize";
import { convert } from "html-to-text";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SEARCH_SERVICE_BASE_URI } from "../../constants/endpoints";
import { CellContext, ColumnDef } from "@tanstack/react-table";

interface VolumesProps {
  [key: string]: unknown;
}

interface VolumeSourceData {
  _id: string;
  _source: {
    sourcedMetadata: {
      comicvine: {
        volumeInformation: {
          name: string;
          description?: string;
          image: {
            small_url: string;
          };
          publisher: {
            name: string;
          };
          count_of_issues: number;
        };
      };
    };
    acquisition?: {
      directconnect?: unknown[];
    };
  };
}

interface VolumeInformation {
  name: string;
  publisher: {
    name: string;
  };
  count_of_issues?: number;
}

export const Volumes = (_props: VolumesProps): ReactElement => {
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
  const columnData = useMemo(
    (): ColumnDef<VolumeSourceData, unknown>[] => [
      {
        header: "Volume Details",
        id: "volumeDetails",
        size: 450,
        accessorFn: (row: VolumeSourceData) => row,
        cell: (info: CellContext<VolumeSourceData, VolumeSourceData>) => {
          const comicObject = info.getValue();
          const {
            _source: { sourcedMetadata },
          } = comicObject;
          const description = sourcedMetadata.comicvine.volumeInformation.description || '';
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
                  {description ? ellipsize(
                    convert(
                      description,
                      {
                        baseElements: {
                          selectors: ["p"],
                        },
                      },
                    ),
                    180,
                  ) : ''}
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
            cell: (props: CellContext<VolumeSourceData, unknown[] | undefined>) => {
              const row = props.getValue() || [];
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
            cell: (props: CellContext<VolumeSourceData, VolumeInformation>) => {
              const row = props.getValue();
              return <div className="mt-5 text-md">{row?.publisher?.name}</div>;
            },
          },
          {
            header: "Issue Count",
            accessorKey:
              "_source.sourcedMetadata.comicvine.volumeInformation.count_of_issues",
            cell: (props: CellContext<VolumeSourceData, number>) => {
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
          <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
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
          <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
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
