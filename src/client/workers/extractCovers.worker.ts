import {
  walkFolder,
  extractCoverFromComicBookArchive,
} from "../actions/fileops.actions";
import { IExtractedComicBookCoverFile } from "../../server/interfaces/folder.interface";
const ndjsonStream = require("can-ndjson-stream");

export const greet = async (
  path: string,
): Promise<IExtractedComicBookCoverFile[] | unknown | any> => {
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
  const reader = await ndjsonStream(fo).getReader();
  reader.read().then(function process({ done, value }) {
    if (done) {
      console.log("done");
      return;
    }

    console.log(value);

    return reader.read().then(process);
  });
  // return JSON.stringify(fo);
};
