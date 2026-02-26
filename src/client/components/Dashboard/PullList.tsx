import React, { ReactElement, useState, useCallback } from "react";
import { map } from "lodash";
import Card from "../shared/Carda";
import Header from "../shared/Header";
import { importToDB } from "../../actions/fileops.actions";
import ellipsize from "ellipsize";
import { Link } from "react-router-dom";

import axios from "axios";
import rateLimiter from "axios-rate-limit";
import { setupCache } from "axios-cache-interceptor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { COMICVINE_SERVICE_URI, LIBRARY_SERVICE_BASE_URI } from "../../constants/endpoints";
import { Field, Form } from "react-final-form";
import DatePickerDialog from "../shared/DatePicker";
import { format } from "date-fns";

type PullListProps = {
  issues: any;
};

const http = rateLimiter(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
  maxRPS: 1,
});
const cachedAxios = setupCache(axios);
export const PullList = (): ReactElement => {
  const queryClient = useQueryClient();
  
  // datepicker
  const date = new Date();
  const [inputValue, setInputValue] = useState<string>(
    format(date, "yyyy/M/dd"),
  );

  // embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });

  const {
    data: pullList,
    refetch,
    isSuccess,
    isLoading,
    isError,
  } = useQuery({
    queryFn: async (): any =>
      await cachedAxios(`${COMICVINE_SERVICE_URI}/getWeeklyPullList`, {
        method: "get",
        params: { startDate: inputValue, pageSize: "15", currentPage: "1" },
      }),
    queryKey: ["pullList", inputValue],
  });

  const { mutate: addToLibrary } = useMutation({
    mutationFn: async ({ sourceName, metadata }: { sourceName: string; metadata: any }) => {
      const comicBookMetadata = {
        importType: "new",
        payload: {
          rawFileDetails: {
            name: "",
          },
          importStatus: {
            isImported: true,
            tagged: false,
            matchedResult: {
              score: "0",
            },
          },
          sourcedMetadata: metadata || null,
          acquisition: { source: { wanted: true, name: sourceName } },
        },
      };
      
      return await axios.request({
        url: `${LIBRARY_SERVICE_BASE_URI}/rawImportToDb`,
        method: "POST",
        data: comicBookMetadata,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch wanted comics queries
      queryClient.invalidateQueries({ queryKey: ["wantedComics"] });
    },
  });

  const next = () => {
    // sliderRef.slickNext();
  };
  const previous = () => {
    // sliderRef.slickPrev();
  };

  return (
    <>
      <Header
          headerContent="Discover"
          subHeaderContent={
            <span className="text-md">
              Pull List aggregated for the week from{" "}
              <span className="underline">
                <a href="https://leagueofcomicgeeks.com">
                  League Of Comic Geeks
                </a>
                <i className="icon-[solar--arrow-right-up-outline] w-4 h-4" />
              </span>
            </span>
          }
          iconClassNames="fa-solid fa-binoculars mr-2"
          link="/pull-list/all/"
        />
        <div className="flex flex-row gap-5 mb-3">
          {/* select week */}
          <div className="flex flex-row gap-4 my-3">
            <Form
              onSubmit={() => {}}
              render={({ handleSubmit }) => (
                <form>
                  <div className="flex flex-col gap-2">
                    {/* week selection for pull list */}
                    <DatePickerDialog
                      inputValue={inputValue}
                      setter={setInputValue}
                    />
                    {inputValue && (
                      <div className="text-sm">
                        Showing pull list for{" "}
                        <span className="inline-flex mb-2 items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md dark:text-slate-900 dark:bg-slate-400">
                          {inputValue}
                        </span>
                      </div>
                    )}
                  </div>
                </form>
              )}
            />
          </div>
        </div>
      <div className="w-lvw -mr-4 sm:-mr-6 lg:-mr-8 mt-3">
        {isSuccess && !isLoading && (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {map(pullList?.data.result, (issue, idx) => {
                return (
                  <div
                    key={idx}
                    className="flex-[0_0_200px] min-w-0 sm:flex-[0_0_220px] md:flex-[0_0_240px] lg:flex-[0_0_260px] xl:flex-[0_0_280px] pr-[15px]"
                  >
                    <Card
                      orientation={"vertical-2"}
                      imageUrl={issue.coverImageUrl}
                      hasDetails
                      title={ellipsize(issue.issueName, 25)}
                    >
                      <div className="px-1">
                        <span className="inline-flex mb-2 items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md dark:text-slate-900 dark:bg-slate-400">
                          {issue.publicationDate}
                        </span>
                        <div className="flex flex-row justify-end">
                          <button
                            className="flex space-x-1 mb-2 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-2 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                            onClick={() => addToLibrary({ sourceName: "locg", metadata: { locg: issue } })}
                          >
                            <i className="icon-[solar--add-square-bold-duotone] w-5 h-5 mr-2"></i>{" "}
                            Want
                          </button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {isLoading && <div>Loading...</div>}
        {isError && <div>An error occurred while retrieving the pull list.</div>}
      </div>
    </>
  );
};

export default PullList;
