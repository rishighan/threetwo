import {
  walkFolder,
  extractCoverFromComicBookArchive,
} from "../actions/fileops.actions";
import { IExtractedComicBookCoverFile } from "../../server/interfaces/folder.interface";
const ndjsonStream = require("can-ndjson-stream");

export const greet = async (
  path: string,
): Promise<IExtractedComicBookCoverFile[]> => {
  const targetOptions = {
    sourceFolder: path,
    extractTarget: "cover",
    targetExtractionFolder: "./userdata/covers",
    extractionMode: "bulk",
  };

  const pagingConfig = {
    pageLimit: 25,
    page: 1,
  };
  const extractionOptions = {
    ...targetOptions,
    paginationOptions: pagingConfig,
  };
  const fileObjects = await walkFolder("./comics");
  const fetchedResource = await extractCoverFromComicBookArchive(
    extractionOptions,
    fileObjects,
  );

  const reader = await ndjsonStream(fetchedResource.body).getReader();
  return reader.read().then(function process({ done, value }) {
    if (done) {
      console.log("done");
      return;
    }

    return reader.read().then(process);
  });
};
