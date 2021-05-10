import router from "../router";
import { default as paginate } from "express-paginate";
import { IExtractionOptions } from "../../interfaces/folder.interface";
import { Request, Response } from "express";
import _ from "lodash";
import H from "highland";
import axios from "axios";
import oboe from "oboe";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  console.log(oboe);
  oboe({
    url: "http://localhost:3000/api/import/getComicCovers",
    method: "POST",
    body: {
      extractionOptions: req.body.extractionOptions,
      walkedFolders: req.body.walkedFolders,
    },
    headers: {
      "Content-Type": "application/json",
      "Content-Length": req.body.length,
    },
  }).node("{name path fileSize}", (data) => {
    console.log(data);
    return res.sendStatus(200);
  });
});

router.route("/walkFolder").post(async (req: Request, res: Response) => {
  const basePathToWalk =
    typeof req.body.basePathToWalk === "string" ? req.body.basePathToWalk : "";
  axios
    .request({
      method: "POST",
      data: {
        basePathToWalk,
      },
    })
    .then((data) => data)
    .catch((error) => error);
});

export default router;
