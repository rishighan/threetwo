import axios from "axios";
import { IExtractionOptions } from "threetwo-ui-typings";
import { SETTINGS_OBJECT_FETCHED } from "../constants/action-types";
import { SETTINGS_SERVICE_BASE_URI } from "../constants/endpoints";

export const saveSettings =
  (settingsObject, airdcppUserSettings) => async (dispatch) => {
    const result = await axios({
      url: `${SETTINGS_SERVICE_BASE_URI}/saveSettings`,
      method: "POST",
      data: { settingsObject, airdcppUserSettings },
    });
    dispatch({
      type: SETTINGS_OBJECT_FETCHED,
      data: result.data,
    });
  };

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
