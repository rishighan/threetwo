export interface IFolderResponse {
  data: Array<IFolderData>;
}

export interface IComicVineSearchMatch {
  description: string;
  id: number;
  volumes: string;
}
export interface IFolderData {
  name: string;
  extension: string;
  containedIn: string;
  isFile: boolean;
  isLink: boolean;
}
