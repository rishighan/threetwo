import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { isUndefined } from "lodash";
import { SETTINGS_SERVICE_BASE_URI } from "../constants/endpoints";

export interface InitialState {
  data: object;
  inProgress: boolean;
  dbFlushed: boolean;
  torrentsList: Array<any>;
}
const initialState: InitialState = {
  data: {},
  inProgress: false,
  dbFlushed: false,
  torrentsList: [],
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    SETTINGS_CALL_IN_PROGRESS: (state) => {
      state.inProgress = true;
    },

    SETTINGS_OBJECT_FETCHED: (state, action) => {
      state.data = action.payload;
      state.inProgress = false;
    },

    SETTINGS_OBJECT_DELETED: (state, action) => {
      state.data = action.payload;
      state.inProgress = false;
    },

    SETTINGS_DB_FLUSH_SUCCESS: (state, action) => {
      state.dbFlushed = action.payload;
      state.inProgress = false;
    },

    SETTINGS_QBITTORRENT_TORRENTS_LIST_FETCHED: (state, action) => {
      console.log(state);
      console.log(action);
      state.torrentsList = action.payload;
    },
  },
});

export const {
  SETTINGS_CALL_IN_PROGRESS,
  SETTINGS_OBJECT_FETCHED,
  SETTINGS_OBJECT_DELETED,
  SETTINGS_DB_FLUSH_SUCCESS,
  SETTINGS_QBITTORRENT_TORRENTS_LIST_FETCHED,
} = settingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const torrentsList = (state: RootState) => state.settings.torrentsList;
export const qBittorrentSettings = (state: RootState) => {
  console.log(state);
  if (!isUndefined(state.settings?.data?.bittorrent)) {
    return state.settings?.data?.bittorrent.client.host;
  }
};
export default settingsSlice.reducer;
