export interface IFolderResponse {
  data: Array<IFolderData>;
}

export interface IExtractionOptions {
  folderDetails: IFolderData;
  extractTarget: string;
  sourceFolder: string;
  targetComicCoversFolder: string;
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

export interface IExplodedPathResponse {
  exploded: Array<string>;
  fileName: string | Array<string>;
}

export interface IComicBookCoverMetadata {
  name: string;
  path: string;
  containedIn: string;
  fileSize: string;
  imageHash: string;
  dimensions: {
    width: string;
    height: string;
  };
}

export interface IExtractedComicBookCoverFile {
  name: string;
  path: string;
  fileSize: number;
}

export interface IExtractComicBookCoverErrorResponse {
  message: string;
  errorCode: string;
  data: string;
}
