import React, { ReactElement, useState } from "react";
import { map } from "lodash";
import Card from "../shared/Carda";
import Header from "../shared/Header";
import { importToDB } from "../../actions/fileops.actions";
import ellipsize from "ellipsize";
import { Link } from "react-router-dom";

import axios from "axios";
import rateLimiter from "axios-rate-limit";
import { setupCache } from "axios-cache-interceptor";
import { useQuery } from "@tanstack/react-query";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { COMICVINE_SERVICE_URI } from "../../constants/endpoints";
import { Field, Form } from "react-final-form";
import DatePickerDialog from "../shared/DatePicker";

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
  // datepicker
  const [selected, setSelected] = useState<Date>();
  let footer = <p>Please pick a day.</p>;
  if (selected) {
    footer = <p>You picked {format(selected, "PP")}.</p>;
  }

  // keen slider
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      slides: {
        origin: "auto",
        number: 15,
        perView: 5,
        spacing: 15,
      },
      slideChanged() {
        console.log("slide changed");
      },
    },
    [
      // add plugins here
    ],
  );

  const {
    data: pullList,
    isSuccess,
    isLoading,
    isError,
  } = useQuery({
    queryFn: async (): any =>
      await cachedAxios(`${COMICVINE_SERVICE_URI}/getWeeklyPullList`, {
        method: "get",
        params: { startDate: "2024-2-20", pageSize: "15", currentPage: "1" },
      }),
    queryKey: ["pullList"],
  });
  const addToLibrary = (sourceName: string, locgMetadata) =>
    importToDB(sourceName, { locg: locgMetadata });

  const next = () => {
    // sliderRef.slickNext();
  };
  const previous = () => {
    // sliderRef.slickPrev();
  };

  return (
    <>
      <div className="content">
        <Header
          headerContent="Discover"
          subHeaderContent="Pull List aggregated for the week from League Of Comic Geeks"
          iconClassNames="fa-solid fa-binoculars mr-2"
        />
        <div className="flex flex-row gap-5 mb-5">
          {/* select week */}
          <div className="flex flex-row gap-4 my-3">
            <Form
              onSubmit={() => {}}
              render={({ handleSubmit }) => (
                <form>
                  {/* week selection for pull list */}

                  <DatePickerDialog />
                </form>
              )}
            />
            <div>
              {/* See all pull list issues */}
              <Link to={"/pull-list/all/"}>
                <button className="flex space-x-1 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500">
                  View all issues
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isSuccess && !isLoading && (
        <div ref={sliderRef} className="keen-slider flex flex-row">
          {map(pullList?.data.result, (issue, idx) => {
            return (
              <div key={idx} className="keen-slider__slide">
                <Card
                  orientation={"vertical-2"}
                  imageUrl={issue.cover}
                  hasDetails
                  title={ellipsize(issue.name, 25)}
                >
                  <div className="px-1">
                    <span className="inline-flex mb-2 items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      {issue.publisher}
                    </span>
                    <div className="flex flex-row justify-end">
                      <button
                        className="flex space-x-1 mb-2 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-2 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                        onClick={() => addToLibrary("locg", issue)}
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
      )}
      {isLoading ? <div>Loading...</div> : null}
      {isError ? (
        <div>An error occurred while retrieving the pull list.</div>
      ) : null}
    </>
  );
};

export default PullList;
