import axios from "axios";
import { IFolderData } from "../interfaces/comicinfo.interfaces";
import {
  IExtractComicBookCoverErrorResponse,
  IExtractedComicBookCoverFile,
  IExtractionOptions,
} from "../../../server/interfaces/folder.interface";
import { FS_API_BASE_URI } from "../../constants/endpoints";

export async function walkFolder(path: string): Promise<Array<IFolderData>> {
  return axios
    .request<Array<IFolderData>>({
      url: FS_API_BASE_URI + "/walkFolder",
      transformResponse: (r: string) => JSON.parse(r),
    })
    .then((response) => {
      const { data } = response;
      return data;
    });
}

export async function extractCoverFromComicBookArchive(
  options: IExtractionOptions,
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractedComicBookCoverFile[]
  | IExtractComicBookCoverErrorResponse
> {
  return await axios.request({
    url: FS_API_BASE_URI + "/getComicCovers",
    data: {
      ...options,
    },
  });
}

export async function foo() {
  return { as: "af" };
}
