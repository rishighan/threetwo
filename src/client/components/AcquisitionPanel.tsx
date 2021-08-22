import React, { useState, useEffect, useCallback, ReactElement } from "react";
import { search } from "../actions/airdcpp.actions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "threetwo-ui-typings";
import { each, isNil, map } from "lodash";

interface IAcquisitionPanelProps {
  comicBookMetadata: any;
}

export const AcquisitionPanel = (
  props: IAcquisitionPanelProps,
): ReactElement => {
  const volumeName =
    props.comicBookMetadata.sourcedMetadata.comicvine.volumeInformation.name;
  const issueName = props.comicBookMetadata.sourcedMetadata.comicvine.name;
  const airDCPPSearchResults = useSelector(
    (state: RootState) => state.airdcpp.results,
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
      pattern: `${volumeName}`,
      // file_type: "compressed",
      extensions: ["cbz", "cbr"],
    },
    hub_urls: ["perfection.crabdance.com:777"],
    priority: 1,
  };
  return (
    <div className="comic-detail">
      <button
        className="button"
        onClick={() => getDCPPSearchResults(dcppQuery)}
      >
        Search on AirDC++
      </button>

      {/* results */}
      {!isNil(airDCPPSearchResults) && (
        <table className="table is-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Slots</th>
            </tr>
          </thead>
          <tbody>
            {map(airDCPPSearchResults, ({ name, type, slots, users }) => {
              return (
                <tr>
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
                      <span className="tag is-success">{slots.free} free</span>
                      <span className="tag is-light">{slots.total}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AcquisitionPanel;
