import React, { createContext, ReactElement } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_BASE_URI } from "../../constants/endpoints";
import { useDispatch } from "react-redux";
import { RMQ_SOCKET_CONNECTED } from "../../constants/action-types";

const WebSocketContext = createContext(null);
export const WebSocketProvider = ({ children }): ReactElement => {
  const dispatch = useDispatch();
  const socket: Socket = io(SOCKET_BASE_URI);

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

  const ws: any = {
    socket,
  };

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};
export { WebSocketContext };
export default WebSocketProvider;
