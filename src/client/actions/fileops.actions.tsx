import axios from "axios";
import { IFolderData } from "threetwo-ui-typings";
import {
  COMICVINE_SERVICE_URI,
  IMAGETRANSFORMATION_SERVICE_BASE_URI,
  LIBRARY_SERVICE_BASE_URI,
  LIBRARY_SERVICE_HOST,
} from "../constants/endpoints";
import {
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
  LS_IMPORT,
  IMG_ANALYSIS_CALL_IN_PROGRESS,
  IMG_ANALYSIS_DATA_FETCH_SUCCESS,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_SUCCESS,
  IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS,
  FILEOPS_STATE_RESET,
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
 *
 * using {@link Renderer}.
 *
 * Used by external plugins
 *
 * @param  {Object} options
 * @return {Promise<string>}                HTML of the page
 */
export const fetchComicBookMetadata = (options) => async (dispatch) => {
  const extractionOptions = {
    extractTarget: "cover",
    targetExtractionFolder: "./userdata/covers",
    extractionMode: "bulk",
    paginationOptions: {
      pageLimit: 25,
      page: 1,
    },
  };

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
    data: { extractionOptions },
  });
};

export const getComicBooks = (options) => async (dispatch) => {
  const { paginationOptions } = options;
  return axios
    .request({
      url: `${LIBRARY_SERVICE_BASE_URI}/getComicBooks`,
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
        url: `${LIBRARY_SERVICE_BASE_URI}/rawImportToDb`,
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
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookGroups`,
        method: "GET",
      })
      .then((data) => {
        dispatch({
          type: IMS_COMIC_BOOK_GROUPS_FETCHED,
          data: data.data,
        });
      });
  } catch (error) {
    dispatch({
      type: IMS_COMIC_BOOK_GROUPS_CALL_FAILED,
      error,
    });
  }
};
export const fetchComicVineMatches =
  (searchPayload, issueSearchQuery, seriesSearchQuery?) => (dispatch) => {
    try {
      dispatch({
        type: CV_API_CALL_IN_PROGRESS,
      });
      console.log(issueSearchQuery);
      console.log(seriesSearchQuery);
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
          console.log(response);
          let matches: any = [];
          if (
            !isNil(response.data.results) &&
            response.data.results.length === 1
          ) {
            matches = response.data.results;
          } else {
            matches = response.data.map((match) => match);
          }
          console.log(matches);
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

export const extractComicArchive =
  (path: string, options: IExtractionOptions) => async (dispatch) => {
    const comicBookPages: string[] = [];
    dispatch({
      type: IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_CALL_IN_PROGRESS,
    });
    const extractedComicBookArchive = await axios({
      method: "POST",
      url: `${LIBRARY_SERVICE_BASE_URI}/unrarArchive`,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      data: {
        options,
        filePath: path,
      },
    });
    map(extractedComicBookArchive.data, (page) => {
      const pathItems = page.filePath.split("/");
      const folderName = pathItems[pathItems.length - 2];

      const imagePath = encodeURI(
        `${LIBRARY_SERVICE_HOST}/userdata/expanded/` +
          folderName +
          `/` +
          page.name +
          page.extension,
      );
      comicBookPages.push(imagePath);
    });
    console.log(comicBookPages);
    dispatch({
      type: IMS_COMIC_BOOK_ARCHIVE_EXTRACTION_SUCCESS,
      extractedComicBookArchive: comicBookPages,
    });
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
