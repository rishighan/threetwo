import { create } from "zustand";
import { isEmpty, isUndefined } from "lodash";
import React, { createContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AirDCPPSocket from "../services/DcppSearchService";
import axios from "axios";

export const useStore = create((set, get) => ({
  airDCPPSocketConnected: false,
  disconnectionInfo: {},
  setAirDCPPSocketConnectionStatus: () =>
    set((value) => ({
      airDCPPSocketConnected: value,
    })),
  getAirDCPPConnectionStatus: () => {
    const airDCPPSocketConnectionStatus = get().airDCPPSocketConnected;
  },
}));

const { getState, setState } = useStore;

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
  // Attempt connection
  const socketConnectionInformation = await initializedAirDCPPSocket.connect();
};

console.log("connected?", getState());
