import router from "../router";
import { default as paginate } from "express-paginate";
import { walkFolder, extractArchive, getCovers } from "../../utils/fs.utils";
import _ from "lodash";
import { Request, Response } from "express";
import { default as oboe } from "oboe";
import { IExtractionOptions } from "../../interfaces/folder.interface";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const foo = await getCovers(
    req.body.extractionOptions,
    req.body.walkedFolders,
  );

  _.each(foo, (item, idx) => {
    let jsonStr = JSON.stringify(item) + "\n";
    jsonStr.toStream().pipe(res) 
  });

  // return res.json(foo);
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
