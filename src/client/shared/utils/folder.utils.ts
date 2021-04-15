import axios from "axios";
import { IFolderData } from "../interfaces/comicinfo.interfaces";
import { FOLDERUTIL_URI } from "../../constants/endpoints";

export async function folderWalk(): Promise<Array<IFolderData>> {
  return axios
    .request<Array<IFolderData>>({
      url: FOLDERUTIL_URI,
      transformResponse: (r: string) => JSON.parse(r),
    })
    .then((response) => {
      const { data } = response;
      return data;
    });
}

export async function foo() {
  return { as: "af" };
}
