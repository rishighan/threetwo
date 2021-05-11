import {
  walkFolder,
  extractCoverFromComicBookArchive,
} from "../actions/fileops.actions";
import { IExtractedComicBookCoverFile } from "../../server/interfaces/folder.interface";
const ndjsonStream = require("can-ndjson-stream");
import fetch from "node-fetch";
import { API_BASE_URI } from "../constants/endpoints";

export const greet = async (
  path: string,
): Promise<IExtractedComicBookCoverFile[] | unknown | any> => {
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
  reader.read().then(function process({ done, value }) {
    if (done) {
      console.log("done");
      return;
    }

    return reader.read().then(process);
  });
};
