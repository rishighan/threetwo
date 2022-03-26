import React, { ReactElement } from "react";

export const ComicInfoXML = (data): ReactElement => {
  const { json } = data;
  console.log(data);
  return (
    <div className="comicInfo-metadata">
      <dl className="has-text-size-7">
        <dd className="has-text-weight-medium">{json.series[0]}</dd>
        <dd className="mt-2 mb-2">
          <div className="field is-grouped is-grouped-multiline">
            <div className="control">
              <span className="tags has-addons">
                <span className="tag">Pages</span>
                <span className="tag is-warning is-light">
                  {json.publisher[0]}
                </span>
              </span>
            </div>
            <div className="control">
              <span className="tags has-addons">
                <span className="tag">Issue #</span>
                <span className="tag is-warning is-light">
                  {parseInt(json.number[0], 10)}
                </span>
              </span>
            </div>
            <div className="control">
              <span className="tags has-addons">
                <span className="tag">Pages</span>
                <span className="tag is-warning is-light">
                  {json.pagecount[0]}
                </span>
              </span>
            </div>
            <div className="control">
              <span className="tags has-addons">
                <span className="tag">Genre</span>
                <span className="tag is-success is-light">{json.genre[0]}</span>
              </span>
            </div>
          </div>
        </dd>
        <dd>
          <span className="is-size-7">{json.notes[0]}</span>
        </dd>
        <dd className="mt-1 mb-1">{json.summary[0]}</dd>
      </dl>
    </div>
  );
};

export default ComicInfoXML;
