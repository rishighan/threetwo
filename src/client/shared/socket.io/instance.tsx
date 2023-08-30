import io from "socket.io-client";
import { SOCKET_BASE_URI } from "../../constants/endpoints";
const sessionId = localStorage.getItem("sessionId");
const socketIOConnectionInstance = io(SOCKET_BASE_URI, {
  transports: ["websocket"],
  withCredentials: true,
  query: { sessionId },
});

export default socketIOConnectionInstance;
