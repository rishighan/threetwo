import io from "socket.io-client";
import { SOCKET_BASE_URI } from "../../constants/endpoints";

const socketIOConnectionInstance = io(SOCKET_BASE_URI, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socketIOConnectionInstance;
