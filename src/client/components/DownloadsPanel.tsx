import React, { useEffect, ReactElement } from "react";
import { getDownloadProgress } from "../actions/airdcpp.actions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "threetwo-ui-typings";
import { isNil, map } from "lodash";
import prettyBytes from "pretty-bytes";

interface IDownloadsPanelProps {
  data: any;
  comicObjectId: string;
}

export const DownloadsPanel = (
  props: IDownloadsPanelProps,
): ReactElement | null => {
  const downloadProgressTick = useSelector(
    (state: RootState) => state.airdcpp.downloadProgressData,
  );
  const dispatch = useDispatch();
  //   useEffect(() => {
  //     dispatch(getDownloadProgress(props.data._id));
  //   }, [dispatch]);

  const ProgressTick = (props) => (
    <div className="column is-one-quarter">
      {JSON.stringify(props.downloadProgressTick)}
      <progress
        className="progress is-small is-success"
        value={props.downloaded_bytes}
        max={props.size}
      >
        {(parseInt(props.downloaded_bytes) / parseInt(props.size)) * 100}%
      </progress>
      <dl>
        <dt>{props.name}</dt>
        <dd>
          {prettyBytes(props.downloaded_bytes)} of
          {prettyBytes(props.size)}
        </dd>
        <dd>
          {prettyBytes(props.speed)} per second. Time left:
          {parseInt(props.seconds_left) / 60}
        </dd>
        <dd>{props.target}</dd>
      </dl>
    </div>
  );

  const Bundles = (props) => {
    return (
      <div>
        <dl>
          {!isNil(props.data) &&
            props.data &&
            map(props.data, (bundle) => (
              <span key={bundle.id}>
                <dt>{bundle.name}</dt>
                <dd>{bundle.target}</dd>
                <dd>{bundle.size}</dd>
              </span>
            ))}
        </dl>
      </div>
    );
  };

  return !isNil(props.data) ? <Bundles data={props.data} /> : null;
};

export default DownloadsPanel;
