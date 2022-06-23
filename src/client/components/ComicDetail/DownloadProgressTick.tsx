import prettyBytes from "pretty-bytes";
import React, { ReactElement } from "react";

export const DownloadProgressTick = (props): ReactElement => {
  return (
    <div >
      <h4 className="is-size-6">{props.data.name}</h4>
      <div>
        <span className="is-size-3 has-text-weight-semibold">
          {prettyBytes(props.data.downloaded_bytes)} of{" "}
          {prettyBytes(props.data.size)}{" "}
        </span>
        <progress
          className="progress is-small is-success"
          value={props.data.downloaded_bytes}
          max={props.data.size}
        >
          {(parseInt(props.data.downloaded_bytes) / parseInt(props.data.size)) *
            100}
          %
        </progress>
      </div>
      <div className="is-size-5">
        {prettyBytes(props.data.speed)} per second.
      </div>
      <div className="is-size-5">
        Time left:
        {Math.round(parseInt(props.data.seconds_left) / 60)}
      </div>
      <div>{props.data.target}</div>
    </div>
  );
};

export default DownloadProgressTick;
