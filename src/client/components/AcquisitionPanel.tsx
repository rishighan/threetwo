import React, { useCallback, ReactElement } from "react";
import { search, downloadAirDCPPItem } from "../actions/airdcpp.actions";
import { useDispatch, useSelector } from "react-redux";
import { RootState, SearchInstance } from "threetwo-ui-typings";
import { isNil, map } from "lodash";

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

  const dispatch = useDispatch();
  const getDCPPSearchResults = useCallback(
    (searchQuery) => {
      dispatch(search(searchQuery));
    },
    [dispatch],
  );

  const dcppQuery = {
    query: {
      pattern: `${sanitizedVolumeName.replace(/#/g, "")}`,
      // pattern: "Templier T2.cbr",
      extensions: ["cbz", "cbr"],
    },
    hub_urls: [
      "adcs://novosibirsk.dc-dev.club:7111/?kp=SHA256/4XFHJFFBFEI2RS75FPRPPXPZMMKPXR764ABVVCC2QGJPQ34SDZGA",
    ],
    priority: 5,
  };

  const downloadDCPPResult = useCallback(
    (searchInstanceId, resultId, comicBookObjectId) =>
      dispatch(
        downloadAirDCPPItem(searchInstanceId, resultId, comicBookObjectId),
      ),
    [dispatch],
  );
  return (
    <>
      <div className="comic-detail columns">
        <div className="column is-one-fifth">
          <button
            className={
              isAirDCPPSearchInProgress
                ? "button is-loading is-warning"
                : "button"
            }
            onClick={() => getDCPPSearchResults(dcppQuery)}
          >
            Search on AirDC++
          </button>
        </div>
        {/* AirDC++ search instance details */}
        {!isNil(searchInfo) && !isNil(searchInstance) && (
          <>
            <div className="column is-one-quarter is-size-7">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <dl>
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
      <div>
        {!isNil(airDCPPSearchResults) && (
          <table className="table is-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Slots</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>
                {JSON.stringify(airDCPPSearchResults)}</td></tr>
              {/* {map(airDCPPSearchResults, ({ name, type, slots, users, id }) => {
                return (
                  <tr key={id}>
                    <td>
                      <p className="mb-2">
                        {type.id === "directory" ? (
                          <i className="fas fa-folder"></i>
                        ) : null}{" "}
                        {name}
                      </p>
                      <dl>
                        <dd>
                          <div className="tags">
                            <span className="tag is-light is-info">
                              {users.user.nicks}
                            </span>
                            {users.user.flags.map((flag, idx) => (
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
                        {type.id === "directory" ? "directory" : type.str}
                      </span>
                    </td>
                    <td>
                      <div className="tags has-addons">
                        <span className="tag is-success">
                          {slots.free} free
                        </span>
                        <span className="tag is-light">{slots.total}</span>
                      </div>
                    </td>
                    <td>
                      <a
                        onClick={() =>
                          downloadDCPPResult(
                            searchInstance.id,
                            id,
                            props.comicBookMetadata._id,
                          )
                        }
                      >
                        <i className="fas fa-file-download"></i>
                      </a>
                    </td>
                  </tr>
                );
              })} */}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AcquisitionPanel;
