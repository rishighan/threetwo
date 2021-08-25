import React, { useEffect, ReactElement } from "react";
import { getDownloadProgress } from "../actions/airdcpp.actions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "threetwo-ui-typings";
import { isNil } from "lodash";
import prettyBytes from "pretty-bytes";

interface IDownloadsPanelProps {
  data: any;
}

export const DownloadsPanel = (
  props: IDownloadsPanelProps,
): ReactElement | null => {
  const downloadProgressTick = useSelector(
    (state: RootState) => state.airdcpp.downloadProgressData,
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDownloadProgress("12312"));
  }, [dispatch]);
  return !isNil(downloadProgressTick) ? (
    <div className="column is-one-quarter">
      {JSON.stringify(downloadProgressTick)}
      <progress
        className="progress is-small is-success"
        value={downloadProgressTick.downloaded_bytes}
        max={downloadProgressTick.size}
      >
        {(parseInt(downloadProgressTick.downloaded_bytes) /
          parseInt(downloadProgressTick.size)) *
          100}
        %
      </progress>
      <dl>
        <dt>{downloadProgressTick.name}</dt>
        <dd>
          {prettyBytes(downloadProgressTick.downloaded_bytes)} of
          {prettyBytes(downloadProgressTick.size)}
        </dd>
        <dd>
          {prettyBytes(downloadProgressTick.speed)} per second. Time left:
          {parseInt(downloadProgressTick.seconds_left) / 60}
        </dd>
        <dd>{downloadProgressTick.target}</dd>
      </dl>
    </div>
  ) : null;
};

export default DownloadsPanel;
