import React, { createContext } from "react";

export const SocketIOContext = createContext({});

export const SocketIOProvider = ({ children, socket }) => {
  return (
    <SocketIOContext.Provider value={socket}>
      {children}
    </SocketIOContext.Provider>
  );
};
