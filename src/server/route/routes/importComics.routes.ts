import router from "../router";
import { default as paginate } from "express-paginate";
import { walkFolder, extractArchive, getCovers } from "../../utils/fs.utils";
import { IExtractionOptions } from "../../interfaces/folder.interface";
import { Request, Response } from "express";
const H = require("highland");
import _ from "lodash";
const toStream = require("streammagic").toStream;
require("streammagic")();

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const foo = await getCovers(
    req.body.extractionOptions,
    req.body.walkedFolders,
  );
    let jsonStr;
  // For each page of data you get, loop over the items like you say
  _.each(foo, (item) => {
    _.each(item, (subItem) => {
      jsonStr = JSON.stringify(subItem) + "\n";
      toStream(jsonStr).pipe(res); // Assuming 'res' is the Express response object
    });
  });
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
  return res.json({
    foo,
  });
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
