import * as Comlink from "comlink";
import { walkFolder } from "../actions/fileops.actions";
import { IExtractionOptions } from "../../server/interfaces/folder.interface";

async function importComicBooks() {
  // 1. Walk the folder structure
  // 2. Scan for .cbz, .cbr
  // 3. extract cover image
  // 4. Calculate image hash
  // 5. Get metadata, add to data model
  // 5. Save cover to disk
  // 6. Save model to mongo

  const fileObjects = await walkFolder("./comics");
}

Comlink.expose({
  importComicBooks,
});

export default null as any;
