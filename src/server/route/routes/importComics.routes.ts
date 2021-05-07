import router from "../router";
import { default as paginate } from "express-paginate";
import { walkFolder, extractArchive, getCovers } from "../../utils/fs.utils";
import { IExtractionOptions } from "../../interfaces/folder.interface";
import { Request, Response } from "express";
import _ from "lodash";
import through2 from "through2";
import { Readable } from "stream";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const foo = await getCovers(
    req.body.extractionOptions,
    req.body.walkedFolders,
  );
  const stream = new Readable({
    objectMode: true,
    highWaterMark: 1,
    read() {},
  });

  const ndjsonStream = through2(
    { objectMode: true, highWaterMark: 1 },
    (data, enc, cb) => {
      cb(null, JSON.stringify(data) + "\n");
    },
  );

  // Through pipe we do a double addressing, our reading stream goes through the transformation
  // to finally go through the stream response..
  stream.pipe(ndjsonStream).pipe(res);

  stream.push(foo);
  stream.push(null);

  // return res.json({
  //   foo,
  // });
});

router.route("/walkFolder").post(async (req: Request, res: Response) => {
  const basePathToWalk =
    typeof req.query.basePathToWalk === "string"
      ? req.query.basePathToWalk
      : "";
  const results = await walkFolder(basePathToWalk);
  res.json(results);
});

export default router;
