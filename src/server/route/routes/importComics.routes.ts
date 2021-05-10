import router from "../router";
import { default as paginate } from "express-paginate";
import { IExtractionOptions } from "../../interfaces/folder.interface";
import { Request, Response } from "express";
import _ from "lodash";
import H from "highland";
import intoStream from "into-stream";
const ndjson = require("ndjson");
import axios from "axios";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const foo = await axios
    .request({
      url: "http://localhost:3000/api/import/getComicCovers",
      method: "POST",
      data: {
        extractionOptions: req.body.extractionOptions,
        walkedFolders: req.body.walkedFolders,
      },
    })
    .then((data) => data.data)
    .catch((error) => error);
    res.json(foo);
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
