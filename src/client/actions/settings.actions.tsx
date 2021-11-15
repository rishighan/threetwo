import axios from "axios";
import { IExtractionOptions } from "threetwo-ui-typings";
import {} from "../constants/action-types";
import { SETTINGS_SERVICE_BASE_URI } from "../constants/endpoints";

export const saveSettings = (settingsObject) => async (dispatch) => {
  const result = await axios({
    url: `${SETTINGS_SERVICE_BASE_URI}/saveSettings`,
    method: "POST",
    data: settingsObject,
  });
  console.log(result);
};
