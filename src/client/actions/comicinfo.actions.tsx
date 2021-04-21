import axios from "axios";
import rateLimiter from "axios-rate-limit";
import qs from "qs";
import {
  CV_SEARCH_SUCCESS,
  CV_API_CALL_IN_PROGRESS,
  CV_API_GENERIC_FAILURE,
} from "../constants/action-types";
import { COMICBOOKINFO_SERVICE_URI } from "../constants/endpoints";

const http = rateLimiter(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
  maxRPS: 1,
});

export const comicinfoAPICall = (options) => async (dispatch) => {
  try {
    dispatch({
      type: CV_API_CALL_IN_PROGRESS,
      inProgress: true,
    });
    const serviceURI = COMICBOOKINFO_SERVICE_URI + options.callURIAction;
    const response = await http(serviceURI, {
      method: options.callMethod,
      params: options.callParams,
      data: options.data ? options.data : null,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: "repeat" });
      },
    });

    switch (options.callURIAction) {
      case "search":
        dispatch({
          type: CV_SEARCH_SUCCESS,
          result: response.data,
        });
        break;

      default:
        console.log("Could not complete request.");
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: CV_API_GENERIC_FAILURE,
      error,
    });
  }
};
