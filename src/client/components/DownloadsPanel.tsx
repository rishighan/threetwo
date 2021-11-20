import React, { useEffect, useContext, ReactElement } from "react";
import {
  getDownloadProgress,
  getBundlesForComic,
} from "../actions/airdcpp.actions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "threetwo-ui-typings";
import { isEmpty, isNil, map } from "lodash";
import prettyBytes from "pretty-bytes";
import dayjs from "dayjs";
import ellipsize from "ellipsize";
import { AirDCPPSocketContext } from "../context/AirDCPPSocket";

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
  const bundles = useSelector((state: RootState) => {
    return state.airdcpp.bundles;
  });

  // AirDCPP Socket initialization
  const userSettings = useSelector((state: RootState) => state.settings.data);
  const { ADCPPSocket } = useContext(AirDCPPSocketContext);

  const dispatch = useDispatch();
  // Fetch the downloaded files and currently-downloading file(s) from AirDC++
  useEffect(() => {
    try {
      if (!isEmpty(userSettings)) {
        dispatch(
          getBundlesForComic(props.comicObjectId, ADCPPSocket, {
            username: `${userSettings.directConnect.client.username}`,
            password: `${userSettings.directConnect.client.password}`,
          }),
        );
        dispatch(
          getDownloadProgress(props.comicObjectId, ADCPPSocket, {
            username: `${userSettings.directConnect.client.username}`,
            password: `${userSettings.directConnect.client.password}`,
          }),
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }, [dispatch]);

  const ProgressTick = (props) => {
    console.log("tick", props);
    return (
      <div className="column is-half">
        {JSON.stringify(props.data.downloadProgressTick)}
        <progress
          className="progress is-small is-success"
          value={props.data.downloaded_bytes}
          max={props.data.size}
        >
          {(parseInt(props.data.downloaded_bytes) / parseInt(props.data.size)) *
            100}
          %
        </progress>
        <div className="card">
          <div className="card-content is-size-7">
            <dl>
              <dt>{props.data.name}</dt>
              <dd>
                {prettyBytes(props.data.downloaded_bytes)} of{" "}
                {prettyBytes(props.data.size)}
              </dd>
              <dd>{prettyBytes(props.data.speed)} per second.</dd>
              <dd>
                Time left:
                {parseInt(props.data.seconds_left) / 60}
              </dd>
              <dd>{props.data.target}</dd>
            </dl>
          </div>
        </div>
      </div>
    );
  };

  const Bundles = (props) => {
    return (
      <table className="table is-striped">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Size</th>
            <th>Download Time</th>
          </tr>
        </thead>
        <tbody>
          {!isNil(props.data) &&
            props.data &&
            map(props.data, (bundle) => (
              <tr key={bundle.id}>
                <td>
                  <h5>{ellipsize(bundle.name, 58)}</h5>
                  <span className="is-size-7">{bundle.target}</span>
                </td>
                <td>{prettyBytes(bundle.size)}</td>
                <td>
                  {dayjs
                    .unix(bundle.time_finished)
                    .format("h:mm on ddd, D MMM, YYYY")}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  return !isNil(props.data) ? (
    <div className="columns">
      {!isNil(downloadProgressTick) ? (
        <ProgressTick data={downloadProgressTick} />
      ) : null}
      {!isEmpty(ADCPPSocket) ? (
        <Bundles data={bundles} />
      ) : (
        <div className="column is-three-fifths">
          <article className="message is-info">
            <div className="message-body is-size-6 is-family-secondary">
              AirDC++ is not configured. Please configure it in{" "}
              <code>Settings</code>.
            </div>
          </article>
        </div>
      )}
    </div>
  ) : null;
};

export default DownloadsPanel;
