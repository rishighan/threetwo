import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { SETTINGS_SERVICE_BASE_URI } from "../constants/endpoints";
import AirDCPPSocket from "../services/DcppSearchService";

const AirDCPPSocketContext = createContext({});
const AirDCPPSocketContextProvider = ({ children }) => {
  const [airDCPPConfiguration, setValue] = useState({});
  useEffect(() => {
    const initializeAirDCPPSocket = () => {
      axios({
        url: `${SETTINGS_SERVICE_BASE_URI}/getSettings`,
        method: "POST",
        data: "",
      }).then(async (data) => {
        const { directConnect } = data.data;
        const initializedAirDCPPSocket = new AirDCPPSocket({
          protocol: `${directConnect.client.host.protocol}`,
          hostname: `${directConnect.client.host.hostname}`,
        });
        await initializedAirDCPPSocket.connect(
          `${directConnect.client.host.username}`,
          `${directConnect.client.host.password}`,
          true,
        );
        setValue({
          AirDCPPSocket: initializedAirDCPPSocket,
          settings: data.data,
        });
      });
    };
    initializeAirDCPPSocket();
  }, []);

  // the Provider gives access to the context to its children

  console.log(airDCPPConfiguration);
  return (
    <AirDCPPSocketContext.Provider value={airDCPPConfiguration}>
      {children}
    </AirDCPPSocketContext.Provider>
  );
};

export { AirDCPPSocketContext, AirDCPPSocketContextProvider };
