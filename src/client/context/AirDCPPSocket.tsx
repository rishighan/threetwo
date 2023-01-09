import { isEmpty, isUndefined } from "lodash";
import React, { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAirDCPPSocketConnectionAsActive } from "../actions/airdcpp.actions";
import { getSettings } from "../actions/settings.actions";

import AirDCPPSocket from "../services/DcppSearchService";

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
  const dispatch = useDispatch();
  const [airDCPPState, persistSettings] = useState(initState);
  const airDCPPSettings = useSelector(
    (state: RootState) => state.settings.data,
  );

  // 1. get settings from mongo
  useEffect(() => {
    dispatch(getSettings());
  }, []);

  // 2. If available, init AirDC++ Socket with those settings
  useEffect(() => {
    if (!isEmpty(airDCPPSettings)) {
      initializeAirDCPPSocket(airDCPPSettings);
    }
  }, [airDCPPSettings]);

  // Method to init AirDC++ Socket with supplied settings
  const initializeAirDCPPSocket = async (configuration) => {
    console.log("[AirDCPP]: Initializing socket...");
    const {
      directConnect: {
        client: { host },
      },
    } = configuration;

    const initializedAirDCPPSocket = new AirDCPPSocket({
      protocol: `${host.protocol}`,
      hostname: `${host.hostname}:${host.port}`,
    });

    // connect and disconnect handlers
    initializedAirDCPPSocket.onConnected = (sessionInfo) => {
      dispatch(setAirDCPPSocketConnectionAsActive());
    };
    initializedAirDCPPSocket.onDisconnected = async (
      reason,
      code,
      wasClean,
    ) => {
      console.log("kulkarni kamal kulthe", reason, code, wasClean);
    };

    const socketConnectionInformation = await initializedAirDCPPSocket.connect(
      `${host.username}`,
      `${host.password}`,
      true,
    );

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
