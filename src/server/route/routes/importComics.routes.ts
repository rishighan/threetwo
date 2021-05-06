import router from "../router";
import { default as paginate } from "express-paginate";
import { walkFolder, extractArchive, getCovers } from "../../utils/fs.utils";
import _ from "lodash";
import { IExtractionOptions } from "../../interfaces/folder.interface";
import { Request, Response } from "express";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const foo = await getCovers(
    req.body.extractionOptions,
    req.body.walkedFolders,
  );
  return res.json(foo);
  // const extractedData = await extractArchive(req.body);
  // if (
  //   _.isArray(extractedData) &&
  //   !_.isUndefined(req.body.paginationOptions.pageLimit)
  // ) {
  //   const pageCount = Math.ceil(
  //     extractedData.length / req.body.paginationOptions.pageLimit,
  //   );

  //   return res.json({
  //     object: "list",
  //     has_more: paginate.hasNextPages(req)(pageCount),
  //     pageCount,
  //     itemCount: extractedData.length,
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
