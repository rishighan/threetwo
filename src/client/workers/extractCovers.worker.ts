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
  console.log(path);
  const targetOptions = {
    sourceFolder: path,
    extractTarget: "cover",
    targetExtractionFolder: "./userdata/covers",
  };
  const fileObjects = await walkFolder("./comics");
  _.map(fileObjects, async (fileObject) => {
    console.log(fileObject);
    if (SUPPORTED_COMIC_ARCHIVES.includes(fileObject.extension)) {
      console.log({ ...targetOptions, folderDetails: fileObject });
      await extractCoverFromComicBookArchive({
        ...targetOptions,
        folderDetails: fileObject,
      });
    }
  });
};
