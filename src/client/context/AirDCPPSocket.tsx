import { isEmpty, isUndefined } from "lodash";
import React, { createContext, useEffect, useState } from "react";
import { toggleAirDCPPSocketConnectionStatus } from "../actions/airdcpp.actions";
import { getSettings } from "../actions/settings.actions";
import { useQuery, useMutation } from "@tanstack/react-query";

import AirDCPPSocket from "../services/DcppSearchService";
import axios from "axios";

const AirDCPPSocketContextProvider = ({ children }) => {
  // setter for settings for use in the context consumer
  const setSettings = (settingsObject) => {
    persistSettings({
      ...airDCPPState,
      airDCPPState: {
        settings: settingsObject,
        socket: {},
        socketConnectionInformation: {},
      },
    });
  };
  // 1. default zero-state for AirDC++ configuration
  const initState = {
    airDCPPState: {
      settings: {},
      socket: {},
      socketConnectionInformation: {},
    },
    setSettings: setSettings,
  };
  const [airDCPPState, persistSettings] = useState(initState);

  // 1. get settings from mongo
  const { data, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3000/api/settings/getAllSettings",
        method: "GET",
      }),
  });

  const directConnectConfiguration = data?.data.directConnect.client.host;

  // 2. If available, init AirDC++ Socket with those settings
  useEffect(() => {
    if (!isEmpty(directConnectConfiguration)) {
      initializeAirDCPPSocket(directConnectConfiguration);
    }
  }, [directConnectConfiguration]);

  // Method to init AirDC++ Socket with supplied settings
  const initializeAirDCPPSocket = async (configuration) => {
    console.log("[AirDCPP]: Initializing socket...");

    const initializedAirDCPPSocket = new AirDCPPSocket({
      protocol: `${configuration.protocol}`,
      hostname: `${configuration.hostname}:${configuration.port}`,
      username: `${configuration.username}`,
      password: `${configuration.password}`,
    });

    // connect and disconnect handlers
    initializedAirDCPPSocket.onConnected = (sessionInfo) => {
      // dispatch(toggleAirDCPPSocketConnectionStatus("connected", sessionInfo));
    };
    initializedAirDCPPSocket.onDisconnected = async (
      reason,
      code,
      wasClean,
    ) => {
      // dispatch(
      //   toggleAirDCPPSocketConnectionStatus("disconnected", {
      //     reason,
      //     code,
      //     wasClean,
      //   }),
      // );
    };

    const socketConnectionInformation =
      await initializedAirDCPPSocket.connect();

    // update the state with the new socket connection information
    persistSettings({
      ...airDCPPState,
      airDCPPState: {
        settings: configuration,
        socket: initializedAirDCPPSocket,
        socketConnectionInformation,
      },
    });
  };

  // the Provider gives access to the context to its children
  return (
    <AirDCPPSocketContext.Provider value={airDCPPState}>
      {children}
    </AirDCPPSocketContext.Provider>
  );
};
const AirDCPPSocketContext = createContext({
  airDCPPState: {},
  saveSettings: () => {},
});

export { AirDCPPSocketContext, AirDCPPSocketContextProvider };
