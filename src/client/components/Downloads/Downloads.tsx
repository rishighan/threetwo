import React, { ReactElement, useCallback, useContext, useEffect } from "react";
import { getSettings } from "../../actions/settings.actions";
import { getTransfers } from "../../actions/airdcpp.actions";
import { useDispatch, useSelector } from "react-redux";
import { AirDCPPSocketContext } from "../../context/AirDCPPSocket";
import AirDCPPSocket from "../../services/DcppSearchService";
import { isEmpty, isUndefined } from "lodash";

interface IDownloadsProps {
  data: any;
}

export const Downloads = (props: IDownloadsProps): ReactElement => {
  const { ADCPPSocket, setADCPPSocket } = useContext(AirDCPPSocketContext);
  const dispatch = useDispatch();
  const airDCPPClientSettings = useSelector(
    (state: RootState) => state.settings.data,
  );
  useEffect(() => {
    dispatch(getSettings());
  }, []);

  useEffect(() => {
    if (!isEmpty(airDCPPClientSettings)) {
      setADCPPSocket(
        new AirDCPPSocket({
          hostname: `${airDCPPClientSettings.directConnect.client.host.hostname}`,
          protocol: `${airDCPPClientSettings.directConnect.client.host.protocol}`,
        }),
      );
    }
  }, [airDCPPClientSettings]);

  console.log(airDCPPClientSettings);
  // Make the call to get all transfers from AirDC++
  useEffect(() => {
    if (!isUndefined(ADCPPSocket) && !isEmpty(airDCPPClientSettings)) {
      dispatch(
        getTransfers(ADCPPSocket, {
          username: `${airDCPPClientSettings.directConnect.client.host.username}`,
          password: `${airDCPPClientSettings.directConnect.client.host.password}`,
        }),
      );
    }
  }, [ADCPPSocket]);
  //   const getAllDownloads = useCallback(() => {});

  return <></>;
};

export default Downloads;
