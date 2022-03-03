import { map } from "lodash";
import React, { ReactElement } from "react";
import ellipsize from "ellipsize";
import { Link } from "react-router-dom";
import Masonry from "react-masonry-css";

export const VolumeGroups = (props): ReactElement => {
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 2,
    500: 1,
  };
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
        {map(props.volumeGroups, (data) => {
          return map(data.data, (group) => {
            return (
              <div className="stack" key={group.id}>
                <img src={group.volume.image.small_url} />
                <div className="content">
                  <div className="stack-title is-size-8">
                    <Link to={`/volume/details/${group.id}`}>
                      {ellipsize(group.volume.name, 18)}
                    </Link>
                  </div>
                  <div className="control">
                    <span className="tags has-addons">
                      <span className="tag is-primary is-light">Issues</span>
                      <span className="tag">
                        {group.volume.count_of_issues}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          });
        })}
      </Masonry>
    </section>
  );
};

export default VolumeGroups;
