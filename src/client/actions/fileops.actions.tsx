import axios from "axios";
import { IFolderData } from "threetwo-ui-typings";
import {
  COMICVINE_SERVICE_URI,
  IMAGETRANSFORMATION_SERVICE_BASE_URI,
  LIBRARY_SERVICE_BASE_URI,
  LIBRARY_SERVICE_HOST,
  SEARCH_SERVICE_BASE_URI,
} from "../constants/endpoints";
import {
  IMS_COMIC_BOOK_GROUPS_FETCHED,
  IMS_COMIC_BOOK_GROUPS_CALL_IN_PROGRESS,
  IMS_COMIC_BOOK_GROUPS_CALL_FAILED,
  IMS_RECENT_COMICS_FETCHED,
  IMS_WANTED_COMICS_FETCHED,
  CV_API_CALL_IN_PROGRESS,
  CV_SEARCH_SUCCESS,
  CV_CLEANUP,
  IMS_CV_METADATA_IMPORT_CALL_IN_PROGRESS,
  IMS_CV_METADATA_IMPORT_SUCCESSFUL,
  IMS_CV_METADATA_IMPORT_FAILED,
  LS_IMPORT,
  IMG_ANALYSIS_CALL_IN_PROGRESS,
  IMG_ANALYSIS_DATA_FETCH_SUCCESS,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_SUCCESS,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS,
  SS_SEARCH_RESULTS_FETCHED,
  SS_SEARCH_IN_PROGRESS,
  FILEOPS_STATE_RESET,
  LS_IMPORT_CALL_IN_PROGRESS,
  LS_TOGGLE_IMPORT_QUEUE,
  SS_SEARCH_FAILED,
  SS_SEARCH_RESULTS_FETCHED_SPECIAL,
  WANTED_COMICS_FETCHED,
  VOLUMES_FETCHED,
  CV_WEEKLY_PULLLIST_FETCHED,
} from "../constants/action-types";
import { success } from "react-notification-system-redux";

import { isNil, map } from "lodash";

export async function walkFolder(path: string): Promise<Array<IFolderData>> {
  return axios
    .request<Array<IFolderData>>({
      url: `${LIBRARY_SERVICE_BASE_URI}/walkFolders`,
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
 * @return the comic book metadata
 */
export const fetchComicBookMetadata = () => async (dispatch) => {
  dispatch({
    type: LS_IMPORT_CALL_IN_PROGRESS,
  });

  // dispatch(
  //   success({
  //     // uid: 'once-please', // you can specify your own uid if required
  //     title: "Import Started",
  //     message: `<span class="icon-text has-text-success"><i class="fas fa-plug"></i></span> Socket <span class="has-text-info">${socket.id}</span> connected. <strong>${walkedFolders.length}</strong> comics scanned.`,
  //     dismissible: "click",
  //     position: "tr",
  //     autoDismiss: 0,
  //   }),
  // );
  dispatch({
    type: LS_IMPORT,
    meta: { remote: true },
    data: {},
  });
};
export const toggleImportQueueStatus = (options) => async (dispatch) => {
  dispatch({
    type: LS_TOGGLE_IMPORT_QUEUE,
    meta: { remote: true },
    data: { manjhul: "jigyadam", action: options.action },
  });
};
/**
 * Fetches comic book metadata for various types
 * @return metadata for the comic book object categories
 * @param options
 **/
export const getComicBooks = (options) => async (dispatch) => {
  const { paginationOptions, predicate, comicStatus } = options;

  const response = await axios.request({
    url: `${LIBRARY_SERVICE_BASE_URI}/getComicBooks`,
    method: "POST",
    data: {
      paginationOptions,
      predicate,
    },
  });

  switch (comicStatus) {
    case "recent":
      dispatch({
        type: IMS_RECENT_COMICS_FETCHED,
        data: response.data,
      });
      break;
    case "wanted":
      dispatch({
        type: IMS_WANTED_COMICS_FETCHED,
        data: response.data.docs,
      });
      break;
    default:
      console.log("Unrecognized comic status.");
  }
};

/**
 * Makes a call to library service to import the comic book metadata into the ThreeTwo data store.
 * @returns Nothing.
 * @param payload
 */
export const importToDB = (sourceName: string, metadata?: any) => (dispatch) => {
  try {
    const comicBookMetadata = {
      importType: "new",
      payload: {
        rawFileDetails: {
          name: "",
        },
        importStatus: {
          isImported: true,
          tagged: false,
          matchedResult: {
            score: "0",
          },
        },
        sourcedMetadata: metadata || null,
        acquisition: { source: { wanted: true, name: sourceName } },
      }
    };
    dispatch({
      type: IMS_CV_METADATA_IMPORT_CALL_IN_PROGRESS,
    });
    return axios
      .request({
        url: `${LIBRARY_SERVICE_BASE_URI}/rawImportToDb`,
        method: "POST",
        data: comicBookMetadata,
        // transformResponse: (r: string) => JSON.parse(r),
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

export const fetchVolumeGroups = () => async (dispatch) => {
  try {
    dispatch({
      type: IMS_COMIC_BOOK_GROUPS_CALL_IN_PROGRESS,
    });
    const response = await axios.request({
      url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookGroups`,
      method: "GET",
    });
    dispatch({
      type: IMS_COMIC_BOOK_GROUPS_FETCHED,
      data: response.data,
    });
  } catch (error) {
    console.log(error);
  }
};
export const fetchComicVineMatches =
  (searchPayload, issueSearchQuery, seriesSearchQuery?) => async (dispatch) => {
    console.log(issueSearchQuery);
    try {
      dispatch({
        type: CV_API_CALL_IN_PROGRESS,
      });
      axios
        .request({
          url: `${COMICVINE_SERVICE_URI}/volumeBasedSearch`,
          method: "POST",
          data: {
            format: "json",
            // hack
            query: issueSearchQuery.inferredIssueDetails.name
              .replace(/[^a-zA-Z0-9 ]/g, "")
              .trim(),
            limit: "100",
            page: 1,
            resources: "volume",
            scorerConfiguration: {
              searchParams: issueSearchQuery.inferredIssueDetails,
            },
            rawFileDetails: searchPayload.rawFileDetails,
          },
          transformResponse: (r) => {
            const matches = JSON.parse(r);
            return matches;
            // return sortBy(matches, (match) => -match.score);
          },
        })
        .then((response) => {
          let matches: any = [];
          if (
            !isNil(response.data.results) &&
            response.data.results.length === 1
          ) {
            matches = response.data.results;
          } else {
            matches = response.data.map((match) => match);
          }
          dispatch({
            type: CV_SEARCH_SUCCESS,
            searchResults: matches,
            searchQueryObject: {
              issue: issueSearchQuery,
              series: seriesSearchQuery,
            },
          });
        });
    } catch (error) {
      console.log(error);
    }

    dispatch({
      type: CV_CLEANUP,
    });
  };

/**
 * This method is a proxy to `uncompressFullArchive` which uncompresses complete `rar` or `zip` archives
 * @param {string} path The path to the compressed archive
 * @param {any} options Options object
 * @returns {any}
 */
export const extractComicArchive =

  (path: string, options: any): any =>
    async (dispatch) => {
      dispatch({
        type: IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS,
      });
      await axios({
        method: "POST",
        url: `${LIBRARY_SERVICE_BASE_URI}/uncompressFullArchive`,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        data: {
          filePath: path,
          options,
        },
      });
    };

/**
 * Description
 * @param {any} query
 * @param {any} options
 * @returns {any}
 */
export const searchIssue = (query, options) => async (dispatch) => {
  dispatch({
    type: SS_SEARCH_IN_PROGRESS,
  });

  const response = await axios({
    url: `${SEARCH_SERVICE_BASE_URI}/searchIssue`,
    method: "POST",
    data: { ...query, ...options },
  });

  if (response.data.code === 404) {
    dispatch({
      type: SS_SEARCH_FAILED,
      data: response.data,
    });
  }

  switch (options.trigger) {
    case "wantedComicsPage":
      dispatch({
        type: WANTED_COMICS_FETCHED,
        data: response.data.body,
      });
      break;
    case "globalSearchBar":
      dispatch({
        type: SS_SEARCH_RESULTS_FETCHED_SPECIAL,
        data: response.data.hits,
      });
      break;

    case "libraryPage":
      dispatch({
        type: SS_SEARCH_RESULTS_FETCHED,
        data: response.data.body,
      });
      break;
    case "volumesPage":
      dispatch({
        type: VOLUMES_FETCHED,
        data: response.data.body,
      });
      break;

    default:
      break;
  }
};
export const analyzeImage =
  (imageFilePath: string | Buffer) => async (dispatch) => {
    dispatch({
      type: FILEOPS_STATE_RESET,
    });

    dispatch({
      type: IMG_ANALYSIS_CALL_IN_PROGRESS,
    });

    const foo = await axios({
      url: `${IMAGETRANSFORMATION_SERVICE_BASE_URI}/analyze`,
      method: "POST",
      data: {
        imageFilePath,
      },
    });
    dispatch({
      type: IMG_ANALYSIS_DATA_FETCH_SUCCESS,
      result: foo.data,
    });
  };