import { Socket } from "airdcpp-apisocket";

class AirDCPPSocket {
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
