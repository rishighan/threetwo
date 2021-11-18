import React from "react";
import AirDCPPSocket from "../services/DcppSearchService";
import axios from "axios";
import { SETTINGS_SERVICE_BASE_URI } from "../constants/endpoints";

const socketInitConfiguration = await axios({
  url: `${SETTINGS_SERVICE_BASE_URI}/getSettings`,
  method: "POST",
});

export const airDCPPSocket = new AirDCPPSocket({
  hostname: `${socketInitConfiguration.data.directConnect.client.hostname}`,
});

export const SocketContext = React.createContext(airDCPPSocket);
