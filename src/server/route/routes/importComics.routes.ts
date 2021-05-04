import router from "../router";
import { default as paginate } from "express-paginate";
import {
  walkFolder,
  extractArchive,
  unrar,
  unzip,
  extractMetadataFromImage,
  explodePath,
} from "../../utils/fs.utils";
import _ from "lodash";
import { IExtractionOptions } from "../../interfaces/folder.interface";
import { Request, Response } from "express";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const extractedData = await extractArchive(req.body);
  if (_.isArray(extractedData)) {
    const pageCount = Math.ceil(
      extractedData.length / req.body.paginationOptions.pageLimit,
    );
    res.json({
      object: "list",
      has_more: paginate.hasNextPages(req)(pageCount),
      pageCount,
      itemCount: extractedData.length,
      pages: paginate.getArrayPages(req)(
        3,
        pageCount,
        req.body.paginationOptions.page,
      ),
      extractedData,
    });
  }
  // const foo = await extractMetadataFromImage(
  //   "./comics/covers/Ghosts and Ruins-001.jpg",
  // );
  // const foo = await unzipOne(options);
  // const foo = await unzip("asd");
  // const foo = explodePath("Chapter Three/HELLBOY - The Chained Coffin - 069.jpg");
  res.json({
    extractedData,
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
