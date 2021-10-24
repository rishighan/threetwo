import React, { createContext, ReactElement } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_BASE_URI } from "../../constants/endpoints";
import { useDispatch } from "react-redux";
import { RMQ_SOCKET_CONNECTED } from "../../constants/action-types";
import { success } from "react-notification-system-redux";

const WebSocketContext = createContext(null);
export const WebSocketProvider = ({ children }): ReactElement => {
  const dispatch = useDispatch();
  const socket: Socket = io(SOCKET_BASE_URI);
  socket.on("connect", () => {
    console.log("connected");
    dispatch({
      type: RMQ_SOCKET_CONNECTED,
      isSocketConnected: true,
      socketId: socket.id,
    });
  });
  // on cover extraction
  socket.on("coverExtracted", (data) => {
    console.log("shaket", data);
    dispatch(
      success({
        // uid: 'once-please', // you can specify your own uid if required
        title: "Cover Extracted",
        message: `<span class="icon-text has-text-success"><i class="fas fa-plug"></i></span> Socket <span class="has-text-info">${socket.id}</span> connected. <strong>${data}</strong>`,
        dismissible: "click",
        position: "tr",
        autoDismiss: 0,
      }),
    );
  });
  socket.on("disconnect", () => {
    console.log(`disconnect`);
  });

  socket.emit("bastard", { name: "puk" });
  const ws: any = {
    socket,
  };

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};
export { WebSocketContext };
export default WebSocketProvider;
