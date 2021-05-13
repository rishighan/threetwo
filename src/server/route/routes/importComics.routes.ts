import router from "../router";
import { Request, Response } from "express";
import axios from "axios";
import stream from "stream";
import through2 from "through2";
import hyperquest from "hyperquest";
import es from "event-stream";
import JSONStream from "JSONStream";
import oboe from "oboe";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  oboe({
    url: "http://localhost:3000/api/import/getComicCovers",
    method: "POST",
    body: {
      extractionOptions: req.body.extractionOptions,
      walkedFolders: req.body.walkedFolders,
    },
  }).on("node", ".*", (data) => {
    console.log(data);
    res.write(JSON.stringify(data));
  });
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
