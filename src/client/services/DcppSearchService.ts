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
class AirDCPPSocket {
  /**
   * Creates a new AirDC++ socket connection instance.
   *
   * @constructor
   * @param {Object} configuration - Connection configuration object
   * @param {string} configuration.protocol - HTTP protocol ("http" or "https")
   * @param {string} configuration.hostname - Server hostname with optional port
   * @param {string} configuration.username - AirDC++ username for authentication
   * @param {string} configuration.password - AirDC++ password for authentication
   * @returns {Socket} Configured AirDC++ socket instance
   */
  constructor(configuration) {
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
      logLevel: "verbose",
      ignoredListenerEvents: [
        "transfer_statistics",
        "hash_statistics",
        "hub_counts_updated",
      ],
      username: `${configuration.username}`,
      password: `${configuration.password}`,
    };
    const AirDCPPSocketInstance = Socket(options, window.WebSocket as any);
    return AirDCPPSocketInstance;
  }
}

export default AirDCPPSocket;
