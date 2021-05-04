import {
  walkFolder,
  extractCoverFromComicBookArchive,
} from "../actions/fileops.actions";
import { SUPPORTED_COMIC_ARCHIVES } from "../constants/importer.config";
import { IExtractedComicBookCoverFile } from "../../server/interfaces/folder.interface";
import _ from "lodash";

export const greet = async (
  path: string,
): Promise<IExtractedComicBookCoverFile[] | unknown> => {
  const targetOptions = {
    sourceFolder: path,
    extractTarget: "all",
    targetExtractionFolder: "./userdata/expanded",
  };

  const pagingConfig = {
    pageLimit: 25,
    page: 1,
  };

  const fileObjects = await walkFolder("./comics");
  const extractedDataPromises = _.map(fileObjects, async (fileObject) => {
    if (SUPPORTED_COMIC_ARCHIVES.includes(fileObject.extension)) {
      return await extractCoverFromComicBookArchive({
        ...targetOptions,
        paginationOptions: pagingConfig,
        folderDetails: fileObject,
      });
    }
  });
  Promise.all(extractedDataPromises).then((data) => {
    console.log(data.data);
  });
};
