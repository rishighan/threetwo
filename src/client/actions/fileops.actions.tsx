import axios from "axios";
import { IFolderData, IExtractedComicBookCoverFile } from "threetwo-ui-typings";
import { API_BASE_URI, SOCKET_BASE_URI } from "../constants/endpoints";
import { io } from "socket.io-client";
import {
  IMS_COMICBOOK_METADATA_FETCHED,
  IMS_SOCKET_CONNECTION_CONNECTED,
  IMS_RECENT_COMICS_FETCHED,
} from "../constants/action-types";
import { refineQuery } from "../shared/utils/nlp.utils";
import { assign } from "lodash";

export async function walkFolder(path: string): Promise<Array<IFolderData>> {
  return axios
    .request<Array<IFolderData>>({
      url: "http://localhost:3000/api/import/walkFolders",
      method: "POST",
      data: {
        basePathToWalk: path,
      },
      transformResponse: (r: string) => JSON.parse(r),
    })
    .then((response) => {
      const { data } = response;
      return data;
    })
    .catch((error) => error);
}
/**
 * Fetches comic book covers along with some metadata
 *
 * using {@link Renderer}.
 *
 * Used by external plugins
 *
 * @param  {Object} options
 * @param  {String} options.action          login form action
 * @param  {String} [options.errorMessage]  optional messaga
 * @return {Promise<string>}                HTML of the page
 */
export const fetchComicBookMetadata = (options) => async (dispatch) => {
  const extractionOptions = {
    sourceFolder: options,
    extractTarget: "cover",
    targetExtractionFolder: "./userdata/covers",
    extractionMode: "bulk",
    paginationOptions: {
      pageLimit: 25,
      page: 1,
    },
  };
  const walkedFolders = await walkFolder("./comics");

  const socket = io(SOCKET_BASE_URI, {
    reconnectionDelayMax: 10000,
  });

  socket.on("connect", () => {
    console.log(`connect ${socket.id}`);
    dispatch({
      type: IMS_SOCKET_CONNECTION_CONNECTED,
      socketConnected: true,
    });
  });

  socket.on("disconnect", () => {
    console.log(`disconnect`);
  });
  socket.emit("importComicsInDB", {
    action: "getComicCovers",
    params: {
      extractionOptions,
      walkedFolders,
    },
  });

  socket.on("comicBookCoverMetadata", (data: IExtractedComicBookCoverFile) => {
    dispatch({
      type: IMS_COMICBOOK_METADATA_FETCHED,
      data,
      dataTransferred: true,
    });
  });
};

export const getRecentlyImportedComicBooks = (options) => async (dispatch) => {
  const { paginationOptions } = options;
  return axios
    .request({
      url: "http://localhost:3000/api/import/getRecentlyImportedComicBooks",
      method: "POST",
      data: {
        paginationOptions,
      },
    })
    .then((response) => {
      dispatch({
        type: IMS_RECENT_COMICS_FETCHED,
        data: response.data,
      });
    });
};

export const fetchComicVineMatches = (searchPayload, options) => (dispatch) => {
  try {
    const issueString = searchPayload.rawFileDetails.path.split("/").pop();
    let seriesSearchQuery = {};
    const issueSearchQuery = refineQuery(issueString);
    if (searchPayload.rawFileDetails.containedIn !== "comics") {
      seriesSearchQuery = refineQuery(
        searchPayload.rawFileDetails.containedIn.split("/").pop(),
      );
    }
    console.log({
      issue: issueSearchQuery.searchParams,
      series: seriesSearchQuery.searchParams,
    });
    axios
      .request({
        url: "http://localhost:3080/api/comicvine/fetchseries",
        method: "POST",
        data: {
          format: "json",
          sort: "name%3Aasc",
          query: issueSearchQuery.searchParams.searchTerms.name,
          fieldList: "",
          limit: "10",
          offset: "5",
          resources: "issue",
        },
      })
      .then((response) => {
        console.log("CV says to fuck off:", response);
      });
    return { issueSearchQuery, series: seriesSearchQuery.searchParams };
  } catch (error) {
    console.log(error);
  }
};
