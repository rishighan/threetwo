import { Socket } from "airdcpp-apisocket";

class AirDCPPSocket {
  constructor(configuration) {
    const options = {
      url: `wss://${configuration.hostname}/api/v1/`,
      autoReconnect: false,
      reconnectInterval: 5,
      logLevel: "verbose",
      ignoredListenerEvents: [
        "transfer_statistics",
        "hash_statistics",
        "hub_counts_updated",
      ],
    };
    const AirDCPPSocketInstance = Socket(options, window.WebSocket as any);
    return AirDCPPSocketInstance;
  }
}
export default AirDCPPSocket;
