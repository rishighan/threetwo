import { isNil, map } from "lodash";
import React, { ReactElement, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ellipsize from "ellipsize";
import { Link } from "react-router-dom";
import { fetchVolumeGroups } from "../actions/fileops.actions";
import Masonry from "react-masonry-css";

export const VolumeGroups = (): ReactElement => {
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 2,
    500: 1,
  };
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchVolumeGroups());
  }, [dispatch]);
  const volumeGroups = useSelector(
    (state: RootState) => state.fileOps.comicVolumeGroups,
  );
  console.log(volumeGroups);
  return (
    <section className="volumes-container mt-4">
      <div className="content">
        <p className="title is-4">Volumes</p>
        <p className="subtitle is-7">Based on ComicVine Volume information</p>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="volumes-grid"
        columnClassName="volumes-grid-column"
      >
        {!isNil(volumeGroups) &&
          volumeGroups &&
          map(volumeGroups, (group) => {
            if (!isNil(group._id)) {
              return (
                <div className="stack" key={group._id.id}>
                  <img src={group.data[0].image.small_url} />
                  <div className="content">
                    <div className="stack-title is-size-8">
                      <Link to={`/volume/details/${group.comicBookObjectId}`}>
                        {ellipsize(group.data[0].name, 18)}
                      </Link>
                    </div>
                    <div className="control">
                      <span className="tags has-addons">
                        <span className="tag is-primary is-light">Issues</span>
                        <span className="tag">
                          {group.data[0].count_of_issues}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
      </Masonry>
    </section>
  );
};

export default VolumeGroups;
