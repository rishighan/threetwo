import { map, unionBy } from "lodash";
import React, { ReactElement } from "react";
import ellipsize from "ellipsize";
import { Link, useNavigate } from "react-router-dom";
import Card from "../shared/Carda";

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
          <span className="is-size-4 has-text-weight-semibold">
            <i className="fa-solid fa-layer-group"></i> Volumes
          </span>
          <span className="icon mt-1">
            <i className="fa-solid fa-angle-right"></i>
          </span>
        </a>
        <p className="subtitle is-7">Based on ComicVine Volume information</p>
      </div>
      <div className="grid grid-cols-5 gap-6">
        {map(deduplicatedGroups, (data) => {
          return (
            <div className="max-w-sm py-8 mx-auto" key={data._id}>
              <Card
                orientation="vertical-2"
                key={data._id}
                imageUrl={data.volumes.image.small_url}
                hasDetails
              >
                <div className="content">
                  <div className="stack-title is-size-8">
                    <Link to={`/volume/details/${data._id}`}>
                      {ellipsize(data.volumes.name, 18)}
                    </Link>
                  </div>
                  <div className="control">
                    <span className="tags has-addons">
                      <span className="tag is-primary is-light">Issues</span>
                      <span className="tag">
                        {data.volumes.count_of_issues}
                      </span>
                    </span>
                  </div>
                </div>
              </Card>
              <div className="w-11/12 h-2 mx-auto bg-gray-900 rounded-b opacity-75"></div>
              <div className="w-10/12 h-2 mx-auto bg-gray-900 rounded-b opacity-50"></div>
              <div className="w-9/12 h-2 mx-auto bg-gray-900 rounded-b opacity-25"></div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default VolumeGroups;
