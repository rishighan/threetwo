import axios from "axios";
import { IFolderData } from "../../server/interfaces/folder.interface";
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
