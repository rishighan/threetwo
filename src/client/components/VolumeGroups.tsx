import { isNil, map } from "lodash";
import React, { ReactElement, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ellipsize from "ellipsize";
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
  return (
    <section className="volumes-container">
      <h2 className="subtitle">Volumes</h2>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="volumes-grid"
        columnClassName="volumes-grid-column"
      >
        {!isNil(volumeGroups) &&
          volumeGroups &&
          map(volumeGroups.data, (group) => {
            if (!isNil(group)) {
              return (
                <div className="stack">
                  <img src={group.results.image.small_url} />
                  <div className="content">
                    <div className="stack-title">
                      {ellipsize(group.results.name, 18)}
                    </div>
                    <div className="control">
                      <span className="tags has-addons">
                        <span className="tag is-primary is-light">Issues</span>
                        <span className="tag">
                          {group.results.count_of_issues}
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
