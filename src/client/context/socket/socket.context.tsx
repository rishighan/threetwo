import React, { createContext } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_BASE_URI } from "../../constants/endpoints";
import { useDispatch } from "react-redux";
import { RMQ_SOCKET_CONNECTED } from "../../constants/action-types";

const WebSocketContext = createContext(null);
export const WebSocketProvider = ({ children }) => {
  let socket: Socket;
  let ws;
  const dispatch = useDispatch();

  if (!socket) {
    socket = io(SOCKET_BASE_URI);

    socket.on("connect", () => {
      dispatch({
        type: RMQ_SOCKET_CONNECTED,
        isSocketConnected: true,
        socketId: socket.id,
      });
    });
    socket.on("disconnect", () => {
      console.log(`disconnect`);
    });

    ws = {
      socket: socket,
    };
  }

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};
export { WebSocketContext };
export default WebSocketProvider;
