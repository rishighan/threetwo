/**
 * @fileoverview Redux action creators for application settings management.
 * Provides actions for fetching, deleting, and managing settings, as well as
 * integrations with external services like qBittorrent and Prowlarr.
 * @module actions/settings
 */

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

/**
 * Redux thunk action creator to fetch application settings.
 * Can retrieve all settings or a specific settings key.
 *
 * @param {string} [settingsKey] - Optional specific settings key to fetch
 * @returns {Function} Redux thunk function that dispatches SETTINGS_OBJECT_FETCHED
 */
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

/**
 * Redux thunk action creator to delete all application settings.
 * Clears the settings from the database and resets state to empty object.
 *
 * @returns {Function} Redux thunk function that dispatches SETTINGS_OBJECT_FETCHED with empty data
 */
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

/**
 * Redux thunk action creator to flush the entire database.
 * WARNING: This action is destructive and removes all data from the library database.
 *
 * @returns {Function} Redux thunk function that dispatches SETTINGS_DB_FLUSH_SUCCESS
 */
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

/**
 * Redux thunk action creator to connect and fetch qBittorrent client information.
 * Establishes connection to qBittorrent client and retrieves torrent list.
 *
 * @param {Object} hostInfo - Connection details for qBittorrent
 * @param {string} hostInfo.host - qBittorrent server hostname
 * @param {number} hostInfo.port - qBittorrent server port
 * @param {string} [hostInfo.username] - Authentication username
 * @param {string} [hostInfo.password] - Authentication password
 * @returns {Function} Redux thunk function that dispatches SETTINGS_QBITTORRENT_TORRENTS_LIST_FETCHED
 */
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

/**
 * Redux thunk action creator to test Prowlarr connection.
 * Verifies connection to Prowlarr indexer management service.
 *
 * @param {Object} hostInfo - Connection details for Prowlarr
 * @param {string} hostInfo.host - Prowlarr server hostname
 * @param {number} hostInfo.port - Prowlarr server port
 * @param {string} hostInfo.apiKey - Prowlarr API key
 * @returns {Function} Redux thunk function (currently not implemented)
 * @todo Implement Prowlarr connection verification
 */
export const getProwlarrConnectionInfo = (hostInfo) => async (dispatch) => {};
