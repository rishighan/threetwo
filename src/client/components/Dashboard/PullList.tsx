import React, { ReactElement } from "react";
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
  } = useQuery({
    queryFn: async () =>
      await cachedAxios(`${COMICVINE_SERVICE_URI}/getWeeklyPullList`, {
        method: "get",
        params: { startDate: "2024-2-15", pageSize: "15", currentPage: "1" },
      }),
    queryKey: ["pullList"],
  });
  console.log(pullList?.data.result);
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
        <div className="field is-grouped">
          {/* select week */}
          <div className="control">
            <div className="select is-small">
              <select>
                <option>Select Week</option>
                <option>With options</option>
              </select>
            </div>
          </div>
          {/* See all pull list issues */}
          <div className="control">
            <Link to={"/pull-list/all/"}>
              <button className="button is-small">View all issues</button>
            </Link>
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
                  <div className="px-1 py-1">
                    <span className="text-xs ">{issue.publisher}</span>
                    <button
                      className=""
                      onClick={() => addToLibrary("locg", issue)}
                    >
                      Want
                    </button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default PullList;
