import axios from "axios";
import {
  IFolderData,
  IExtractedComicBookCoverFile,
} from "../../server/interfaces/folder.interface";
import { API_BASE_URI, SOCKET_BASE_URI } from "../constants/endpoints";
import { io } from "socket.io-client";
import {
  IMS_SOCKET_DATA_FETCHED,
  IMS_SOCKET_CONNECTION_CONNECTED,
  IMS_RAW_IMPORT_SUCCESSFUL,
} from "../constants/action-types";

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
export const rawImportToDB = (payload: any) => async (dispatch) => {
  return axios({
    method: "POST",
    url: "http://localhost:3000/api/import/rawImportToDb",
    data: {
      payload,
    },
  }).then((result) => {
    dispatch({
      type: IMS_RAW_IMPORT_SUCCESSFUL,
      rawImportCompleted: result,
    });
    return result;
  });
};

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
  socket.emit("call", {
    action: "getComicCovers",
    params: {
      extractionOptions,
      walkedFolders,
    },
    opts: { garam: "pasha" },
  });

  socket.on("comicBookCoverMetadata", (data: IExtractedComicBookCoverFile) => {
    console.log(data);
    dispatch({
      type: IMS_SOCKET_DATA_FETCHED,
      data,
      dataTransferred: true,
    });
    dispatch(
      rawImportToDB({
        importStatus: {
          isImported: true,
          tagged: false,
          matchedResult: {
            score: "0",
          },
        },
        rawFileDetails: data,
      }),
    );
  });

  socket.on("comicBookCoverMetadataSent", (status) => {
    console.log(status);
  });
};
