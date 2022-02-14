import { isNil, map } from "lodash";
import React, { ReactElement, useEffect } from "react";
import Card from "../Carda";
import Masonry from "react-masonry-css";
import { useDispatch, useSelector } from "react-redux";
import { getWeeklyPullList } from "../../actions/comicinfo.actions";

type PullListProps = {
  issues: any;
};

export const PullList = ({ issues }: PullListProps): ReactElement => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getWeeklyPullList(issues));
  }, []);

  const pullList = useSelector((state: RootState) => state.comicInfo.pullList);

  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 2,
    600: 2,
  };
  return (
    <>
      <div className="content">
        <h4 className="title is-4">Discover</h4>
        <p className="subtitle is-7">
          Pull List aggregated for the week from ComicVine
        </p>
        {/* select week */}
        <div className="select is-small">
          <select>
            <option>Select Week</option>
            <option>With options</option>
          </select>
        </div>
        {/* See all pull list issues */}
        <button className="button is-small">View all issues</button>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="recent-comics-container"
        columnClassName="recent-comics-column"
      >
        {!isNil(pullList) &&
          pullList &&
          map(pullList, (issue) => {
            return (
              <Card
                key={issue.id}
                orientation={"vertical"}
                imageUrl={issue.image.small_url}
                hasDetails
                title={issue.name}
              >
                <div className="content">
                  <div className="control">
                    <span className="tags has-addons">
                      <span className="tag is-primary is-light">Date</span>
                      <span className="tag">{issue.store_date}</span>
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
      </Masonry>
    </>
  );
};

export default PullList;
