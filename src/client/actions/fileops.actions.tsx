import axios from "axios";
import { IFolderData } from "../../server/interfaces/folder.interface";
import { API_BASE_URI } from "../constants/endpoints";
import { io } from "socket.io-client";
import { IMS_SOCKET_DATA_FETCHED } from "../constants/action-types";

export async function walkFolder(path: string): Promise<Array<IFolderData>> {
  return axios
    .request<Array<IFolderData>>({
      url: API_BASE_URI + "walkFolder",
      method: "POST",
      data: {
        basePathToWalk: path,
      },
      transformResponse: (r: string) => JSON.parse(r),
    })
    .then((response) => {
      const { data } = response;
      return data;
    });
}

export const fetchComicBookMetadata = (options) => async (dispatch) => {
  console.log(options);
  const targetOptions = {
    sourceFolder: options,
    extractTarget: "cover",
    targetExtractionFolder: "./userdata/covers",
    extractionMode: "bulk",
  };

  const pagingConfig = {
    pageLimit: 25,
    page: 1,
  };
  const extractionOptions = {
    ...targetOptions,
    paginationOptions: pagingConfig,
  };
  const walkedFolders = await walkFolder("./comics");

  const socket = io("ws://localhost:3000/", {
    reconnectionDelayMax: 10000,
  });

  socket.on("connect", () => {
    console.log(`connect ${socket.id}`);
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

  socket.on("comicBookCoverMetadata", (data) => {
    dispatch({
      type: IMS_SOCKET_DATA_FETCHED,
      data,
      dataTransferred: true,
    });
  });
};
