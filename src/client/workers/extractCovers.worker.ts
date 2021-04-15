import * as Comlink from "comlink";

function add(a, b) {
  return a + b;
}
function importComicBooks() {
  // 1. Walk the folder structure
  // 2. Scan for .cbz, .cbr
  // 3. extract cover image
  // 4. Calculate image hash
  // 5. Get metadata, add to data model
  // 5. Save cover to disk
  // 6. Save model to mongo
}

Comlink.expose({
  add,
});

export default null as any;
