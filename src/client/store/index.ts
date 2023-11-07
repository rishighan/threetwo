import { create } from "zustand";
import { isEmpty } from "lodash";
import AirDCPPSocket from "../services/DcppSearchService";
import axios from "axios";

export const useStore = create((set, get) => ({
  // AirDC++ state
  airDCPPSocketConnected: false,
  airDCPPDisconnectionInfo: {},
  airDCPPClientConfiguration: {},
  airDCPPSocketConnectionInformation: {},
  setAirDCPPSocketConnectionStatus: () =>
    set((value) => ({
      airDCPPSocketConnected: value,
    })),
  getAirDCPPConnectionStatus: () => {
    const airDCPPSocketConnectionStatus = get().airDCPPSocketConnected;
  },
  // Socket.io state
}));

const { getState, setState } = useStore;

// Method to init AirDC++ Socket with supplied settings
const initializeAirDCPPSocket = async (configuration) => {
  console.log("[AirDCPP]: Initializing socket...");

  const initializedAirDCPPSocket = new AirDCPPSocket({
    protocol: `${configuration.protocol}`,
    hostname: `${configuration.hostname}:${configuration.port}`,
    username: `${configuration.username}`,
    password: `${configuration.password}`,
  });

  // Set up connect and disconnect handlers
  initializedAirDCPPSocket.onConnected = (sessionInfo) => {
    // update global state with socket connection status
    setState({
      airDCPPSocketConnected: true,
    });
  };
  initializedAirDCPPSocket.onDisconnected = async (reason, code, wasClean) => {
    // update global state with socket connection status
    setState({
      disconnectionInfo: { reason, code, wasClean },
      airDCPPSocketConnected: false,
    });
  };
  // AirDC++ Socket-related connection and post-connection
  // Attempt connection
  const airDCPPSocketConnectionInformation =
    await initializedAirDCPPSocket.connect();
  setState({
    airDCPPSocketConnectionInformation,
  });

  // Set up event listeners
  initializedAirDCPPSocket.addListener(
    `queue`,
    "queue_bundle_tick",
    async (downloadProgressData) => {
      console.log(downloadProgressData);
    },
  );
  initializedAirDCPPSocket.addListener(
    "queue",
    "queue_bundle_added",
    async (data) => {
      console.log("JEMEN:", data);
    },
  );

  initializedAirDCPPSocket.addListener(
    `queue`,
    "queue_bundle_status",
    async (bundleData) => {
      let count = 0;
      if (bundleData.status.completed && bundleData.status.downloaded) {
        // dispatch the action for raw import, with the metadata
        if (count < 1) {
          console.log(`[AirDCPP]: Download complete.`);

          count += 1;
        }
      }
    },
  );
};

// 1. get settings from mongo
const { data } = await axios({
  url: "http://localhost:3000/api/settings/getAllSettings",
  method: "GET",
});

const directConnectConfiguration = data?.directConnect.client.host;

// 2. If available, init AirDC++ Socket with those settings
if (!isEmpty(directConnectConfiguration)) {
  initializeAirDCPPSocket(directConnectConfiguration);
  setState({
    airDCPPClientConfiguration: directConnectConfiguration,
  });
}

console.log("connected?", getState());
