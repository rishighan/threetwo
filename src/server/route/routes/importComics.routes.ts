import router from "../router";
import { default as paginate } from "express-paginate";
import { IExtractedComicBookCoverFile, IExtractionOptions } from "../../interfaces/folder.interface";
import { Request, Response } from "express";
import _ from "lodash";
import H from "highland";
import axios from "axios";
import oboe from "oboe";
import fs from "fs";
import { Readable } from "stream";
import through2 from "through2";

const getData = (source) => {
  const response: { value: string }[] = [];

  for (let index = 0; index < 100; index++) {
    response.push({ value: "rishi " + index });
  }

  return response;
};
router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const foo = await axios({
    url: "http://localhost:3853/api/import/getComicCovers",
    method: "POST",
    data: {
      extractionOptions: req.body.extractionOptions,
      walkedFolders: req.body.walkedFolders,
    },
  });
  const stream = new Readable({
    objectMode: true,
    highWaterMark: 1,
    read() {},
  });

  // We create the stream transform using through2 library..
  // We instruct it to handle objects, buffer size and transform function,
  // that is, we convert our object to text to be able to send it through the stream response, which does not handle objects..
  const ndjsonStream = through2(
    { objectMode: true, highWaterMark: 1 },
    (data, enc, cb) => {
      cb(null, JSON.stringify(data) + "\n");
    },
  );

  // console.log(ndjsonStream);
  // Through pipe we do a double addressing, our reading stream goes through the transformation
  // to finally go through the stream response..
  stream.pipe(ndjsonStream).pipe(res);
  stream.push({ source1: foo.data });
  stream.push(null);
});

router.route("/walkFolder").post(async (req: Request, res: Response) => {
  const basePathToWalk =
    typeof req.body.basePathToWalk === "string" ? req.body.basePathToWalk : "";
  const walkedFolders = await axios
    .request({
      url: "http://localhost:3853/api/import/walkFolders",
      method: "POST",
      data: {
        basePathToWalk,
      },
    })
    .then((data) => data.data)
    .catch((error) => error);
  return res.json(walkedFolders);
});

export default router;
