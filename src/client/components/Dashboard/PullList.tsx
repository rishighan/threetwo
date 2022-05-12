import { isNil, map } from "lodash";
import React, { createRef, ReactElement, useEffect } from "react";
import Card from "../Carda";
import Masonry from "react-masonry-css";
import { useDispatch, useSelector } from "react-redux";
import { getWeeklyPullList } from "../../actions/comicinfo.actions";
import ellipsize from "ellipsize";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";

type PullListProps = {
  issues: any;
};

export const PullList = ({ issues }: PullListProps): ReactElement => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      getWeeklyPullList({
        startDate: "2022-5-17",
        pageSize: "15",
        currentPage: "1",
      }),
    );
  }, []);

  const pullList = useSelector((state: RootState) => state.comicInfo.pullList);
  let sliderRef = createRef();
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 0,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const next = () => {
    sliderRef.slickNext();
  };
  const previous = () => {
    sliderRef.slickPrev();
  };
  return (
    <>
      <div className="content">
        <h4 className="title is-4">Discover</h4>
        <p className="subtitle is-7">
          Pull List aggregated for the week from League Of Comic Geeks
        </p>
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
          <div className="field has-addons">
            <div className="control">
              <button className="button is-rounded is-small" onClick={previous}>
                <i className="fa-solid fa-caret-left"></i>
              </button>
            </div>
            <div className="control">
              <button className="button is-rounded is-small" onClick={next}>
                <i className="fa-solid fa-caret-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Slider {...settings} ref={(c) => (sliderRef = c)}>
        {!isNil(pullList) &&
          pullList &&
          map(pullList, (issue, idx) => {
            return (
              <Card
                key={idx}
                orientation={"vertical"}
                imageUrl={issue.cover}
                hasDetails
                title={ellipsize(issue.name, 18)}
                cardContainerStyle={{
                  marginRight: 22,
                  boxShadow: "-2px 4px 15px -6px rgba(0,0,0,0.57)",
                }}
              >
                <div className="content">
                  <div className="control">
                    <span className="tag">{issue.publisher}</span>
                  </div>
                </div>
              </Card>
            );
          })}
      </Slider>
    </>
  );
};

export default PullList;
