import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import ellipsize from "ellipsize";

export const ComicVineDetails = (comicVineData): ReactElement => {
  const { data } = comicVineData;
  return (
    <div className="card-container">
      <div className="card">
        <div className="is-horizontal">
          <div className="card-image">
            <figure>
              <img className="image" src={data.comicvine.image.thumb_url} />
            </figure>
          </div>
          <ul className="card-content">
            <li className="name has-text-weight-medium">
              {ellipsize(data.name, 18)}
            </li>
            <li>
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag is-primary is-light">ComicVine ID</span>
                  <span className="tag is-info is-light">
                    {data.comicvine.id}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComicVineDetails;
