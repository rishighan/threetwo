import axios from "axios";
import fetch, { Response } from "node-fetch";
import {
  IExtractionOptions,
  IFolderData,
} from "../../server/interfaces/folder.interface";
import { API_BASE_URI } from "../constants/endpoints";

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

export async function extractCoverFromComicBookArchive(
  extractionOptions: IExtractionOptions,
  walkedFolders: Array<IFolderData>,
): Promise<Response> {
  return await fetch(API_BASE_URI + "getComicCovers", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      extractionOptions,
      walkedFolders,
    }),
  });
}
