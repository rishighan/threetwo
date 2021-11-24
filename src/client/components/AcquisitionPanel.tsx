import React, { useCallback, useContext, ReactElement, useEffect } from "react";
import {
  search,
  downloadAirDCPPItem,
  getBundlesForComic,
} from "../actions/airdcpp.actions";
import { useDispatch, useSelector } from "react-redux";
import { RootState, SearchInstance } from "threetwo-ui-typings";
import ellipsize from "ellipsize";
import { isEmpty, isNil, isUndefined, map, pick } from "lodash";
import { AirDCPPSocketContext } from "../context/AirDCPPSocket";
interface IAcquisitionPanelProps {
  comicBookMetadata: any;
}

export const AcquisitionPanel = (
  props: IAcquisitionPanelProps,
): ReactElement => {
  const volumeName =
    props.comicBookMetadata.sourcedMetadata.comicvine.volumeInformation.name;
  const sanitizedVolumeName = volumeName.replace(/[^a-zA-Z0-9 ]/g, "");
  const issueName = props.comicBookMetadata.sourcedMetadata.comicvine.name;

  // Selectors for picking state
  const airDCPPSearchResults = useSelector((state: RootState) => {
    return state.airdcpp.searchResults;
  });
  const isAirDCPPSearchInProgress = useSelector(
    (state: RootState) => state.airdcpp.isAirDCPPSearchInProgress,
  );
  const searchInfo = useSelector(
    (state: RootState) => state.airdcpp.searchInfo,
  );
  const searchInstance: SearchInstance = useSelector(
    (state: RootState) => state.airdcpp.searchInstance,
  );

  const userSettings = useSelector((state: RootState) => state.settings.data);
  const { ADCPPSocket } = useContext(AirDCPPSocketContext);
  const dispatch = useDispatch();

  const getDCPPSearchResults = useCallback(
    async (searchQuery) => {
      dispatch(
        search(searchQuery, ADCPPSocket, {
          username: `${userSettings.directConnect.client.host.username}`,
          password: `${userSettings.directConnect.client.host.password}`,
        }),
      );
    },
    [dispatch, ADCPPSocket],
  );

  // AirDC++ search query
  const dcppQuery = {
    query: {
      pattern: `${sanitizedVolumeName.replace(/#/g, "")}`,
      // pattern: "Templier T2.cbr",
      extensions: ["cbz", "cbr"],
    },
    // "comic-scans.no-ip.biz:24674",
    hub_urls: map(userSettings.directConnect.client.hubs, (item) => item.value),
    priority: 5,
  };

  // download via AirDC++
  const downloadDCPPResult = useCallback(
    (searchInstanceId, resultId, comicBookObjectId) => {
      dispatch(
        downloadAirDCPPItem(
          searchInstanceId,
          resultId,
          comicBookObjectId,
          ADCPPSocket,
          {
            username: `${userSettings.directConnect.client.host.username}`,
            password: `${userSettings.directConnect.client.host.password}`,
          },
        ),
      );
      // this is to update the download count badge on the downloads tab
      dispatch(
        getBundlesForComic(comicBookObjectId, ADCPPSocket, {
          username: `${userSettings.directConnect.client.host.username}`,
          password: `${userSettings.directConnect.client.host.password}`,
        }),
      );
    },
    [dispatch],
  );

  return (
    <>
      <div className="comic-detail columns">
        {!isEmpty(ADCPPSocket) ? (
          <div className="column is-one-fifth">
            <button
              className={
                isAirDCPPSearchInProgress
                  ? "button is-loading is-warning"
                  : "button"
              }
              onClick={() => getDCPPSearchResults(dcppQuery)}
            >
              <span className="icon is-small">
                <img src="/img/airdcpp_logo.svg" />
              </span>
              <span className="airdcpp-text">Search on AirDC++</span>
            </button>
          </div>
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
        {/* AirDC++ search instance details */}
        {!isNil(searchInfo) && !isNil(searchInstance) && (
          <>
            <div className="column is-one-quarter is-size-7">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <dl>
                      <dt>
                        <div className="tags">
                          {userSettings.directConnect.client.hubs.map(
                            ({ value }) => (
                              <span className="tag" key={value}>
                                {value}
                              </span>
                            ),
                          )}
                        </div>
                      </dt>
                      <dt>Query: {searchInfo.query.pattern}</dt>
                      <dd>
                        Extensions: {searchInfo.query.extensions.join(", ")}
                      </dd>
                      <dd>File type: {searchInfo.query.file_type}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="column is-one-quarter is-size-7">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <dl>
                      <dt>Search Instance: {searchInstance.id}</dt>
                      <dt>Owned by {searchInstance.owner}</dt>
                      <dd>Expires in: {searchInstance.expires_in}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* AirDC++ results */}
      <div className="columns">
        {!isNil(airDCPPSearchResults) && !isEmpty(airDCPPSearchResults) ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Slots</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {map(airDCPPSearchResults, ({ result }, idx) => {
                return (
                  <tr
                    key={idx}
                    className={!isNil(result.dupe) ? "dupe-search-result" : ""}
                  >
                    <td>
                      <p className="mb-2">
                        {result.type.id === "directory" ? (
                          <i className="fas fa-folder"></i>
                        ) : null}{" "}
                        {ellipsize(result.name, 70)}
                      </p>

                      <dl>
                        <dd>
                          <div className="tags">
                            {!isNil(result.dupe) ? (
                              <span className="tag is-warning">Dupe</span>
                            ) : null}
                            <span className="tag is-light is-info">
                              {result.users.user.nicks}
                            </span>
                            {result.users.user.flags.map((flag, idx) => (
                              <span className="tag is-light" key={idx}>
                                {flag}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </dl>
                    </td>
                    <td>
                      <span className="tag is-light is-info">
                        {result.type.id === "directory"
                          ? "directory"
                          : result.type.str}
                      </span>
                    </td>
                    <td>
                      <div className="tags has-addons">
                        <span className="tag is-success">
                          {result.slots.free} free
                        </span>
                        <span className="tag is-light">
                          {result.slots.total}
                        </span>
                      </div>
                    </td>
                    <td>
                      <a
                        onClick={() =>
                          downloadDCPPResult(
                            searchInstance.id,
                            result.id,
                            props.comicBookMetadata._id,
                          )
                        }
                      >
                        <i className="fas fa-file-download"></i>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="column is-three-fifths">
            <article className="message is-info">
              <div className="message-body is-size-6 is-family-secondary">
                Searching via <strong>AirDC++</strong> is still in{" "}
                <strong>alpha</strong>. Some searches may take arbitrarily long,
                or may not work at all. Searches from <code>ADCS</code> hubs are
                more reliable than <code>NMDCS</code> ones.
              </div>
            </article>
          </div>
        )}
      </div>
    </>
  );
};

export default AcquisitionPanel;
