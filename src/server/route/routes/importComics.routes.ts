import router from "../router";
import { default as paginate } from "express-paginate";
import { walkFolder, extractArchive, getCovers } from "../../utils/fs.utils";
import _ from "lodash";
import { Request, Response } from "express";
import fs from "fs";

import { IExtractionOptions } from "../../interfaces/folder.interface";
const { chain } = require("stream-chain");
const { parser } = require("stream-json");
const { pick } = require("stream-json/filters/Pick");
const { ignore } = require("stream-json/filters/Ignore");
const { streamValues } = require("stream-json/streamers/StreamValues");

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const foo = await getCovers(
    req.body.extractionOptions,
    req.body.walkedFolders,
  );
  const pipeline = chain([
    fs.createReadStream(foo),
    parser(),
    // pick({ filter: "data" }),
    streamValues(),
    (data) => {
      const value = data.value;
      return value;
    },
  ]);

  let counter = 0;
  pipeline.on("data", () => ++counter);
  pipeline.on("end", () =>
    console.log(`The accounting department has ${counter} employees.`),
  );
  return res.json(foo);
  // if (
  //   _.isArray(foo) &&
  //   !_.isUndefined(req.body.extractionOptions.paginationOptions.pageLimit)
  // ) {
  //   const pageCount = Math.ceil(
  //     foo.length / req.body.extractionOptions.paginationOptions.pageLimit,
  //   );

  //   return res.json({
  //     has_more: paginate.hasNextPages(req)(pageCount),
  //     pageCount,
  //     itemCount: foo.length,
  //     extractedData,
  //   });
  // }
  // return res.json({
  //   extractedData,
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
