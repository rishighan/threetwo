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
    hub_urls: [
      "adcs://novosibirsk.dc-dev.club:7111/?kp=SHA256/4XFHJFFBFEI2RS75FPRPPXPZMMKPXR764ABVVCC2QGJPQ34SDZGA",
      "dc.fly-server.ru",
    ],
    priority: 1,
  };
  return (
    <>
      <button
        className="button"
        onClick={() => getDCPPSearchResults(dcppQuery)}
      >
        Search on AirDC++
      </button>

      {/* results */}
      <table className="table is-striped">
          <thead>
              <tr>
                  <th>Name</th>
                  <th>Path</th>
              </tr>
          </thead>
        {map(airDCPPSearchResults, ({ name, path }) => {
          return (
            <tr>
              <td>{name}</td>
              <td>{path}</td>
            </tr>
          );
        })}
      </table>
    </>
  );
};

export default AcquisitionPanel;
