import router from "../router";
import { Request, Response } from "express";
import axios from "axios";
import { Readable } from "stream";
import through2 from "through2";
import hyperquest from "hyperquest";
import es from "event-stream";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const comicBookCoversData = hyperquest.post("http://localhost:3853/api/import/getComicCovers",
    {
      data: {
      extractionOptions: req.body.extractionOptions,
      walkedFolders: req.body.walkedFolders,
    },
  });
  console.log(comicBookCoversData.data);
  
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
