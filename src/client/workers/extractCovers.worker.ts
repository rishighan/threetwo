import { walkFolder } from "../actions/fileops.actions";
import { IFolderData } from "../../server/interfaces/folder.interface";

export async function greet(path: string): Promise<IFolderData[]> {
  console.log(path);
  return await walkFolder("./comics");
}
