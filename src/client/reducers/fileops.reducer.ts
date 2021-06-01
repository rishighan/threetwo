import {
  IMS_SOCKET_CONNECTION_CONNECTED,
  IMS_SOCKET_CONNECTION_DISCONNECTED,
  IMS_SOCKET_DATA_FETCHED,
  IMS_SOCKET_ERROR,
} from "../constants/action-types";
const initialState = {
  dataTransferred: false,
  comicBookMetadata: [],
  socketConnected: false,
};

function fileOpsReducer(state = initialState, action) {
  switch (action.type) {
    case IMS_SOCKET_DATA_FETCHED:
      return {
        ...state,
        comicBookMetadata: [...state.comicBookMetadata, action.data.data],
        dataTransferred: true,
      };

    case IMS_SOCKET_CONNECTION_CONNECTED:
      return {
        ...state,
        socketConnected: action.socketConnected,
      };
    default:
      return state;
  }
}

export default fileOpsReducer;
