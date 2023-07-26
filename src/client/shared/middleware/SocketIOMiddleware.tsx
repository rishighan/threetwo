const socketIOMiddleware = (socket) => {
  return (store) => (next) => (action) => {
    if (action.type === "EMIT_SOCKET_EVENT") {
      const { event, data } = action.payload;
      socket.emit(event, data);
    }
    return next(action);
  };
};

export default socketIOMiddleware;
