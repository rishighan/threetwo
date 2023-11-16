import React, { useEffect, useContext, ReactElement } from "react";
import { getBundlesForComic } from "../../actions/airdcpp.actions";
import { RootState } from "threetwo-ui-typings";
import { isEmpty, isNil, map } from "lodash";
import prettyBytes from "pretty-bytes";
import dayjs from "dayjs";
import ellipsize from "ellipsize";

interface IDownloadsPanelProps {
  data: any;
  comicObjectId: string;
}

export const DownloadsPanel = (
  props: IDownloadsPanelProps,
): ReactElement | null => {
  //   const bundles = useSelector((state: RootState) => {
  //     return state.airdcpp.bundles;
  //   });
  //
  //   // AirDCPP Socket initialization
  //   const userSettings = useSelector((state: RootState) => state.settings.data);
  //   const airDCPPConfiguration = useContext(AirDCPPSocketContext);

  const {
    airDCPPState: { socket, settings },
  } = airDCPPConfiguration;

  // Fetch the downloaded files and currently-downloading file(s) from AirDC++
  useEffect(() => {
    try {
      if (!isEmpty(userSettings)) {
        // dispatch(
        //   getBundlesForComic(props.comicObjectId, socket, {
        //     username: `${settings.directConnect.client.host.username}`,
        //     password: `${settings.directConnect.client.host.password}`,
        //   }),
        // );
      }
    } catch (error) {
      throw new Error(error);
    }
  }, [airDCPPConfiguration]);

  const Bundles = (props) => {
    return !isEmpty(props.data) ? (
      <div className="column is-full">
        <table className="table is-striped">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size</th>
              <th>Download Time</th>
              <th>Bundle ID</th>
            </tr>
          </thead>
          <tbody>
            {map(props.data, (bundle) => (
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
                <td>
                  <span className="tag is-warning">{bundle.id}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="column is-full"> {"No Downloads Found"} </div>
    );
  };

  return !isNil(props.data) ? (
    <>
      <div className="columns is-multiline">
        {!isEmpty(socket) ? (
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
    </>
  ) : null;
};

export default DownloadsPanel;
