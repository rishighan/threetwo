import { isNil, map } from "lodash";
import React, { ReactElement, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ellipsize from "ellipsize";
import { fetchVolumeGroups } from "../actions/fileops.actions";

export const VolumeGroups = (): ReactElement => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchVolumeGroups());
  }, [dispatch]);
  const volumeGroups = useSelector(
    (state: RootState) => state.fileOps.comicVolumeGroups,
  );
  return (
    <>
      <h2 className="subtitle">Volumes</h2>
      <div className="stack-card-container">
        {!isNil(volumeGroups) &&
          volumeGroups &&
          map(volumeGroups.data, (group) => {
            if (!isNil(group)) {
              return (
                <div className="stack">
                  <img src={group.results.image.small_url} />
                  <div className="content">
                    {ellipsize(group.results.name, 18)}
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
      </div>
    </>
  );
};

export default VolumeGroups;
