import router from "../router";
import { Request, Response } from "express";
import axios from "axios";
import { Readable } from "stream";
import through2 from "through2";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const comicBookCoversData = await axios({
    url: "http://localhost:3000/api/import/getComicCovers",
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

  const ndjsonStream = through2(
    { objectMode: true, highWaterMark: 1 },
    (data, enc, cb) => {
      cb(null, JSON.stringify(data) + "\n");
    },
  );

  stream.pipe(ndjsonStream).pipe(res);
  stream.push({ data: comicBookCoversData.data });
  stream.push(null);
});

router.route("/walkFolder").post(async (req: Request, res: Response) => {
  const basePathToWalk =
    typeof req.body.basePathToWalk === "string" ? req.body.basePathToWalk : "";
  const walkedFolders = await axios
    .request({
      url: "http://localhost:3000/api/import/walkFolders",
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
