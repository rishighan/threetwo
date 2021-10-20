import axios from "axios";
import { IFolderData, IExtractedComicBookCoverFile } from "threetwo-ui-typings";
import {
  API_BASE_URI,
  IMPORT_SERVICE_BASE_URI,
  SOCKET_BASE_URI,
} from "../constants/endpoints";
import {
  IMS_COMICBOOK_METADATA_FETCHED,
  IMS_COMIC_BOOK_GROUPS_FETCHED,
  IMS_COMIC_BOOK_GROUPS_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_GROUPS_CALL_FAILED,
  IMS_RECENT_COMICS_FETCHED,
  CV_API_CALL_IN_PROGRESS,
  CV_SEARCH_SUCCESS,
  CV_CLEANUP,
  IMS_CV_METADATA_IMPORT_CALL_IN_PROGRESS,
  IMS_CV_METADATA_IMPORT_SUCCESSFUL,
  IMS_CV_METADATA_IMPORT_FAILED,
} from "../constants/action-types";
import { refineQuery } from "../shared/utils/filenameparser.utils";
import sortBy from "array-sort-by";
import { success } from "react-notification-system-redux";
import { Socket } from "socket.io-client";

export async function walkFolder(path: string): Promise<Array<IFolderData>> {
  return axios
    .request<Array<IFolderData>>({
      url: `${IMPORT_SERVICE_BASE_URI}/walkFolders`,
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
 * @return {Promise<string>}                HTML of the page
 */
export const fetchComicBookMetadata =
  (options, socketInstance: Socket) => async (dispatch) => {
    const socket = socketInstance.socket;
    const extractionOptions = {
      extractTarget: "cover",
      targetExtractionFolder: "./userdata/covers",
      extractionMode: "bulk",
      paginationOptions: {
        pageLimit: 25,
        page: 1,
      },
    };
    const walkedFolders = await walkFolder("./comics");
    dispatch(
      success({
        // uid: 'once-please', // you can specify your own uid if required
        title: "Import Started",
        message: `<span class="icon-text has-text-success"><i class="fas fa-plug"></i></span> Socket <span class="has-text-info">${socket.id}</span> connected. <strong>${walkedFolders.length}</strong> comics scanned.`,
        dismissible: "click",
        position: "tr",
        autoDismiss: 0,
      }),
    );
    await axios
      .request({
        url: "http://localhost:8050/api/getComicCovers",
        method: "POST",
        data: {
          extractionOptions,
          walkedFolders,
        },
      })
      .then((response) => {
        console.log("Response from import call", response);
      });

    socket.on("coverExtracted", (data) => {
      console.log(data);
      dispatch({
        type: IMS_COMICBOOK_METADATA_FETCHED,
        data,
      });
    });
  };

export const getComicBooks = (options) => async (dispatch) => {
  const { paginationOptions } = options;
  return axios
    .request({
      url: `${IMPORT_SERVICE_BASE_URI}/getComicBooks`,
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

export const importToDB = (payload?: any) => (dispatch) => {
  try {
    const comicBookMetadata = {
      importStatus: {
        isImported: true,
        tagged: false,
        matchedResult: {
          score: "0",
        },
      },
      sourcedMetadata: { comicvine: payload || null },
    };
    dispatch({
      type: IMS_CV_METADATA_IMPORT_CALL_IN_PROGRESS,
    });

    return axios
      .request({
        url: `${IMPORT_SERVICE_BASE_URI}/rawImportToDb`,
        method: "POST",
        data: comicBookMetadata,
        transformResponse: (r: string) => JSON.parse(r),
      })
      .then((response) => {
        const { data } = response;
        dispatch({
          type: IMS_CV_METADATA_IMPORT_SUCCESSFUL,
          importResult: data,
        });
      });
  } catch (error) {
    dispatch({
      type: IMS_CV_METADATA_IMPORT_FAILED,
      importError: error,
    });
  }
};
export const fetchVolumeGroups = () => (dispatch) => {
  try {
    dispatch({
      type: IMS_COMIC_BOOK_GROUPS_CALL_IN_PROGRESS,
    });
    axios
      .request({
        url: `${IMPORT_SERVICE_BASE_URI}/getComicBookGroups`,
        method: "GET",
      })
      .then((data) => {
        console.log(data);
        dispatch({
          type: IMS_COMIC_BOOK_GROUPS_FETCHED,
          data,
        });
      });
  } catch (error) {
    dispatch({
      type: IMS_COMIC_BOOK_GROUPS_CALL_FAILED,
      error,
    });
  }
};
export const fetchComicVineMatches = (searchPayload) => (dispatch) => {
  try {
    const issueString = searchPayload.rawFileDetails.name;
    const issueSearchQuery: IComicVineSearchQuery = refineQuery(issueString);
    let seriesSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;
    if (searchPayload.rawFileDetails.containedIn !== "comics") {
      seriesSearchQuery = refineQuery(
        searchPayload.rawFileDetails.containedIn.split("/").pop(),
      );
    }

    dispatch({
      type: CV_API_CALL_IN_PROGRESS,
    });

    axios
      .request({
        url: "http://localhost:3080/api/comicvine/fetchresource",
        method: "POST",
        data: {
          format: "json",
          sort: "name%3Aasc",
          // hack
          query: issueSearchQuery.searchParams.searchTerms.name
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim(),
          fieldList: "id",
          limit: "20",
          offset: "0",
          resources: "issue",
          scorerConfiguration: {
            searchQuery: {
              issue: issueSearchQuery,
              series: seriesSearchQuery,
            },
            rawFileDetails: searchPayload.rawFileDetails,
          },
        },
        transformResponse: (r) => {
          const matches = JSON.parse(r);
          return sortBy(matches, (match) => -match.score);
        },
      })
      .then((response) => {
        dispatch({
          type: CV_SEARCH_SUCCESS,
          searchResults: response.data,
          searchQueryObject: {
            issue: issueSearchQuery,
            series: seriesSearchQuery,
          },
        });
      });

    /* return { issueSearchQuery, series: seriesSearchQuery.searchParams }; */
  } catch (error) {
    console.log(error);
  }

  dispatch({
    type: CV_CLEANUP,
  });
};
