import {
  walkFolder,
  extractCoverFromComicBookArchive,
} from "../actions/fileops.actions";
import { IExtractedComicBookCoverFile } from "../../server/interfaces/folder.interface";

export const greet = async (
  path: string,
): Promise<IExtractedComicBookCoverFile[] | unknown> => {
  const targetOptions = {
    sourceFolder: path,
    extractTarget: "all",
    targetExtractionFolder: "./userdata/expanded",
    extractionMode: "bulk",
  };

  const pagingConfig = {
    pageLimit: 25,
    page: 1,
  };

  const fileObjects = await walkFolder("./comics");
  const fo = await extractCoverFromComicBookArchive(
    {
      ...targetOptions,
      paginationOptions: pagingConfig,
    },
    fileObjects,
  );
  return JSON.stringify(fo);
};
