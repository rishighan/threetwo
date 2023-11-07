import axios from "axios";
import {
  SETTINGS_OBJECT_FETCHED,
  SETTINGS_CALL_IN_PROGRESS,
  SETTINGS_DB_FLUSH_SUCCESS,
  SETTINGS_QBITTORRENT_TORRENTS_LIST_FETCHED,
} from "../reducers/settings.reducer";
import {
  LIBRARY_SERVICE_BASE_URI,
  SETTINGS_SERVICE_BASE_URI,
  QBITTORRENT_SERVICE_BASE_URI,
} from "../constants/endpoints";

export const getSettings = (settingsKey?) => async (dispatch) => {
  const result = await axios({
    url: `${SETTINGS_SERVICE_BASE_URI}/getSettings`,
    method: "POST",
    data: settingsKey,
  });
  {
    dispatch({
      type: SETTINGS_OBJECT_FETCHED,
      data: result.data,
    });
  }
};

export const deleteSettings = () => async (dispatch) => {
  const result = await axios({
    url: `${SETTINGS_SERVICE_BASE_URI}/deleteSettings`,
    method: "POST",
  });

  if (result.data.ok === 1) {
    dispatch({
      type: SETTINGS_OBJECT_FETCHED,
      data: {},
    });
  }
};

export const flushDb = () => async (dispatch) => {
  dispatch({
    type: SETTINGS_CALL_IN_PROGRESS,
  });

  const flushDbResult = await axios({
    url: `${LIBRARY_SERVICE_BASE_URI}/flushDb`,
    method: "POST",
  });

  if (flushDbResult) {
    dispatch({
      type: SETTINGS_DB_FLUSH_SUCCESS,
      data: flushDbResult.data,
    });
  }
};

export const getQBitTorrentClientInfo = (hostInfo) => async (dispatch) => {
  await axios.request({
    url: `${QBITTORRENT_SERVICE_BASE_URI}/connect`,
    method: "POST",
    data: hostInfo,
  });
  const qBittorrentClientInfo = await axios.request({
    url: `${QBITTORRENT_SERVICE_BASE_URI}/getClientInfo`,
    method: "GET",
  });

  dispatch({
    type: SETTINGS_QBITTORRENT_TORRENTS_LIST_FETCHED,
    data: qBittorrentClientInfo.data,
  });
};

export const getProwlarrConnectionInfo = (hostInfo) => async (dispatch) => {};
