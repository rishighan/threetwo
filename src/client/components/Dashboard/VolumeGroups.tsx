import { map, unionBy } from "lodash";
import React, { ReactElement } from "react";
import ellipsize from "ellipsize";
import { Link, useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";

export const VolumeGroups = (props): ReactElement => {
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 2,
    500: 1,
  };
  // Till mongo gives us back the deduplicated results with the ObjectId
  const deduplicatedGroups = unionBy(props.volumeGroups, "volumes.id");
  const navigate = useNavigate();
  const navigateToVolumes = (row) => {
    navigate(`/volumes/all`);
  };

  return (
    <section className="volumes-container mt-4">
      <div className="content">
        <a className="mb-1" onClick={navigateToVolumes}>
          <span className="is-size-4 has-text-weight-semibold">Volumes</span>
          <span className="icon mt-1">
            <i className="fa-solid fa-angle-right"></i>
          </span>
        </a>
        <p className="subtitle is-7">Based on ComicVine Volume information</p>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="volumes-grid"
        columnClassName="volumes-grid-column"
      >
        {map(deduplicatedGroups, (data) => {
          return (
            <div className="stack" key={data._id}>
              <img src={data.volumes.image.small_url} />
              <div className="content">
                <div className="stack-title is-size-8">
                  <Link to={`/volume/details/${data._id}`}>
                    {ellipsize(data.volumes.name, 18)}
                  </Link>
                </div>
                <div className="control">
                  <span className="tags has-addons">
                    <span className="tag is-primary is-light">Issues</span>
                    <span className="tag">{data.volumes.count_of_issues}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </Masonry>
    </section>
  );
};

export default VolumeGroups;
