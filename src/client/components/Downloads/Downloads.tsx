import React, { ReactElement, useCallback, useContext, useEffect } from "react";
import { getTransfers } from "../../actions/airdcpp.actions";
import { useDispatch, useSelector } from "react-redux";
import { AirDCPPSocketContext } from "../../context/AirDCPPSocket";
import { isEmpty, isUndefined } from "lodash";
import { searchIssue } from "../../actions/fileops.actions";

interface IDownloadsProps {
  data: any;
}

export const Downloads = (props: IDownloadsProps): ReactElement => {
  const airDCPPConfiguration = useContext(AirDCPPSocketContext);
  const {
    airDCPPState: { settings, socket },
  } = airDCPPConfiguration;
  const dispatch = useDispatch();

  const airDCPPTransfers = useSelector(
    (state: RootState) => state.airdcpp.transfers,
  );
  useEffect(() => {
    dispatch(
      searchIssue(
        {
          query: {},
        },
        {
          pagination: {
            size: 25,
            from: 0,
          },
          type: "wanted",
        },
      ),
    );
  }, []);
  // Make the call to get all transfers from AirDC++
  useEffect(() => {
    if (!isUndefined(socket) && !isEmpty(settings)) {
      dispatch(
        getTransfers(socket, {
          username: `${settings.directConnect.client.host.username}`,
          password: `${settings.directConnect.client.host.password}`,
        }),
      );
    }
  }, [socket]);

 
  //   const getAllDownloads = useCallback(() => {});
  return <pre>{JSON.stringify(airDCPPTransfers, null, 2)}</pre>;
};

export default Downloads;
