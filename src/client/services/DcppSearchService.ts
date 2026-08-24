/**
 * @fileoverview AirDC++ WebSocket service for Direct Connect protocol communication.
 * Provides a configured socket connection to the AirDC++ daemon for search
 * and download operations.
 * @module services/DcppSearchService
 */

import { Socket } from "airdcpp-apisocket";

/**
 * Factory class for creating configured AirDC++ WebSocket connections.
 * Wraps the airdcpp-apisocket library with application-specific configuration.
 *
 * @class AirDCPPSocket
 * @example
 * const socket = new AirDCPPSocket({
 *   protocol: "https",
 *   hostname: "localhost:5600",
 *   username: "admin",
 *   password: "password"
 * });
 * await socket.connect();
 */
interface AirDCPPConfiguration {
  protocol: string;
  hostname: string;
  username: string;
  password: string;
}

/**
 * Creates a new AirDC++ socket connection instance.
 *
 * @param {AirDCPPConfiguration} configuration - Connection configuration object
 * @returns {ReturnType<typeof Socket>} Configured AirDC++ socket instance
 */
function createAirDCPPSocket(configuration: AirDCPPConfiguration): ReturnType<typeof Socket> {
  let socketProtocol = "";
  if (configuration.protocol === "https") {
    socketProtocol = "wss";
  } else {
    socketProtocol = "ws";
  }
  const options = {
    url: `${socketProtocol}://${configuration.hostname}/api/v1/`,
    autoReconnect: true,
    reconnectInterval: 5,
    logLevel: "verbose" as const,
    ignoredListenerEvents: [
      "transfer_statistics",
      "hash_statistics",
      "hub_counts_updated",
    ],
    username: `${configuration.username}`,
    password: `${configuration.password}`,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AirDCPPSocketInstance = Socket(options, window.WebSocket as any);
  return AirDCPPSocketInstance;
}

export default createAirDCPPSocket;
export type { AirDCPPConfiguration };
