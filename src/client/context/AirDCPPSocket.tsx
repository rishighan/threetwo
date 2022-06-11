import axios from "axios";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { SETTINGS_SERVICE_BASE_URI } from "../constants/endpoints";
import AirDCPPSocket from "../services/DcppSearchService";

/**
 * Component for setting up and sharing the AirDC++ socket context.
 *
 * @component
 * @example
 * const age = 21
 * const name = 'Jitendra Nirnejak'
 * return (
 *   <User age={age} name={name} />
 * )
 */

const AirDCPPSocketContext = createContext({});
const AirDCPPSocketContextProvider = ({ children }) => {
  const [airDCPPConfiguration, setValue] = useState({});

  useEffect(() => {
    const initializeAirDCPPSocket = () => {
      axios({
        url: `${SETTINGS_SERVICE_BASE_URI}/getSettings`,
        method: "POST",
        data: "",
      })
        .then(async (data) => {
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
        })
        .catch((error) => console.log(error));
    };
    initializeAirDCPPSocket();
  }, []);
  // the Provider gives access to the context to its children
  return (
    <AirDCPPSocketContext.Provider value={airDCPPConfiguration}>
      {children}
    </AirDCPPSocketContext.Provider>
  );
};

export { AirDCPPSocketContext, AirDCPPSocketContextProvider };
